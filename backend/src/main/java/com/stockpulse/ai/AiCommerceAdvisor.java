package com.stockpulse.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockpulse.dto.PricingRecommendationDto;
import com.stockpulse.dto.ReorderRecommendationDto;
import com.stockpulse.engine.RuleBasedPricingStrategy;
import com.stockpulse.engine.RuleBasedReorderStrategy;
import com.stockpulse.model.PriceDirection;
import com.stockpulse.model.Product;
import com.stockpulse.model.TriggerReason;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class AiCommerceAdvisor {

    private static final Logger log = LoggerFactory.getLogger(AiCommerceAdvisor.class);

    private final LLMGateway llmGateway;
    private final RuleBasedPricingStrategy ruleBasedPricing;
    private final RuleBasedReorderStrategy ruleBasedReorder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiCommerceAdvisor(LLMGateway llmGateway,
                              RuleBasedPricingStrategy ruleBasedPricing,
                              RuleBasedReorderStrategy ruleBasedReorder) {
        this.llmGateway = llmGateway;
        this.ruleBasedPricing = ruleBasedPricing;
        this.ruleBasedReorder = ruleBasedReorder;
    }

    /**
     * AI-driven pricing recommendation with specialized prompt selection,
     * bounds validation, and fallback to deterministic engine on failure.
     */
    public PricingRecommendationDto evaluatePricing(Product product, double categoryAvgVelocity, TriggerReason triggerReason) {
        String prompt = buildPricingPrompt(product, categoryAvgVelocity, triggerReason);

        try {
            String rawJson = llmGateway.callLLM(prompt);
            JsonNode root = objectMapper.readTree(rawJson);

            BigDecimal recommendedPrice = parseAndValidatePrice(root, product.getCurrentPrice());
            PriceDirection direction = parseDirection(root, product.getCurrentPrice(), recommendedPrice);
            Double confidence = parseConfidence(root);
            String reasoning = root.path("reasoning").asText("AI pricing recommendation formulated based on inventory signals and demand velocity.");

            return PricingRecommendationDto.builder()
                    .recommendedPrice(recommendedPrice)
                    .direction(direction)
                    .confidence(confidence)
                    .reasoning("AI Advisor: " + reasoning)
                    .build();

        } catch (Exception e) {
            log.warn("AI Pricing call failed or returned invalid response for SKU [{}]. Falling back to Rule-Based engine. Reason: {}",
                    product.getSku(), e.getMessage());
            PricingRecommendationDto fallback = ruleBasedPricing.evaluatePricing(product, categoryAvgVelocity, triggerReason);
            return PricingRecommendationDto.builder()
                    .recommendedPrice(fallback.getRecommendedPrice())
                    .direction(fallback.getDirection())
                    .confidence(Math.max(0.65, fallback.getConfidence() - 0.1))
                    .reasoning("[Fallback: Rule-Based due to LLM timeout/error] " + fallback.getReasoning())
                    .build();
        }
    }

    /**
     * AI-driven replenishment reorder recommendation with bounds validation and fallback.
     */
    public ReorderRecommendationDto evaluateReorder(Product product, double categoryAvgVelocity, TriggerReason triggerReason) {
        String prompt = buildReorderPrompt(product, categoryAvgVelocity, triggerReason);

        try {
            String rawJson = llmGateway.callLLM(prompt);
            JsonNode root = objectMapper.readTree(rawJson);

            int recommendedQuantity = parseAndValidateQuantity(root, product);
            int leadTimeDays = root.path("suggestedLeadTimeDays").asInt(5);
            if (leadTimeDays < 1 || leadTimeDays > 90) leadTimeDays = 5;

            Double confidence = parseConfidence(root);
            String reasoning = root.path("reasoning").asText("AI replenishment calculated based on burn rate and lead times.");

            return ReorderRecommendationDto.builder()
                    .recommendedQuantity(recommendedQuantity)
                    .suggestedLeadTimeDays(leadTimeDays)
                    .confidence(confidence)
                    .reasoning("AI Advisor: " + reasoning)
                    .build();

        } catch (Exception e) {
            log.warn("AI Reorder call failed or returned invalid response for SKU [{}]. Falling back to Rule-Based engine. Reason: {}",
                    product.getSku(), e.getMessage());
            ReorderRecommendationDto fallback = ruleBasedReorder.evaluateReorder(product, categoryAvgVelocity, triggerReason);
            return ReorderRecommendationDto.builder()
                    .recommendedQuantity(fallback.getRecommendedQuantity())
                    .suggestedLeadTimeDays(fallback.getSuggestedLeadTimeDays())
                    .confidence(Math.max(0.65, fallback.getConfidence() - 0.1))
                    .reasoning("[Fallback: Rule-Based due to LLM timeout/error] " + fallback.getReasoning())
                    .build();
        }
    }

    // --- PROMPT BUILDERS (Two specialized prompts per hackathon specification) ---

    private String buildPricingPrompt(Product product, double categoryAvgVelocity, TriggerReason triggerReason) {
        if (triggerReason == TriggerReason.INVENTORY_LOW) {
            return String.format("""
                Scenario: CRITICAL INVENTORY LOW ALERT
                Product Details:
                - SKU: %s
                - Name: %s
                - Category: %s
                - Current Price: $%.2f
                - Current Stock: %d units
                - Reorder Threshold: %d units
                - Demand Velocity: %d orders in last 24h
                - Category Average Velocity: %.1f orders in last 24h

                Merchandising Dilemma:
                Inventory has crossed below the safety replenishment threshold.
                Evaluate the strategic trade-off:
                1. If demand velocity is active or healthy, recommend a moderate price increase (typically +5%% to +20%%) to throttle velocity and preserve remaining inventory for high-willingness buyers while awaiting restock.
                2. If demand velocity is stagnant or dead, recommend a clearance discount or HOLD to liquidate capital.
                Explain the explicit trade-off in the reasoning.

                Provide your recommendation in strict JSON format:
                {
                  "recommendedPrice": 0.00,
                  "direction": "INCREASE" | "DECREASE" | "HOLD",
                  "confidence": 0.00,
                  "reasoning": "Plain English explanation weighing inventory scarcity against demand elasticity."
                }
                """,
                    product.getSku(), product.getName(), product.getCategory(),
                    product.getCurrentPrice(), product.getStockLevel(), product.getReorderThreshold(),
                    product.getDemandVelocity(), categoryAvgVelocity);
        } else if (triggerReason == TriggerReason.DEMAND_SPIKE) {
            return String.format("""
                Scenario: VIRAL DEMAND SPIKE DETECTED
                Product Details:
                - SKU: %s
                - Name: %s
                - Category: %s
                - Current Price: $%.2f
                - Current Stock: %d units
                - Reorder Threshold: %d units
                - Demand Velocity: %d orders in last 24h (Surge vs Category Avg: %.1f)

                Merchandising Dilemma:
                Product demand velocity is surging drastically compared to category peers.
                Evaluate the strategic trade-off:
                1. Capitalize on heightened consumer intent by increasing price to maximize contribution margin.
                2. Guard against predatory price gouging or customer churn by keeping increases proportionate and defensible (typically +5%% to +25%%).
                Factor in current available stock (%d units).

                Provide your recommendation in strict JSON format:
                {
                  "recommendedPrice": 0.00,
                  "direction": "INCREASE" | "DECREASE" | "HOLD",
                  "confidence": 0.00,
                  "reasoning": "Plain English explanation addressing velocity momentum, elasticity, and margin capture."
                }
                """,
                    product.getSku(), product.getName(), product.getCategory(),
                    product.getCurrentPrice(), product.getStockLevel(), product.getReorderThreshold(),
                    product.getDemandVelocity(), categoryAvgVelocity, product.getStockLevel());
        } else {
            return String.format("""
                Scenario: ON-DEMAND COMMERCE PRICING REVIEW
                Product Details:
                - SKU: %s
                - Name: %s
                - Category: %s
                - Current Price: $%.2f
                - Current Stock: %d units
                - Reorder Threshold: %d units
                - Demand Velocity: %d orders in last 24h (Category Avg: %.1f)

                Analyze current inventory depth, velocity ratios, and category positioning.
                Recommend an optimal price adjustment or hold.

                Provide your recommendation in strict JSON format:
                {
                  "recommendedPrice": 0.00,
                  "direction": "INCREASE" | "DECREASE" | "HOLD",
                  "confidence": 0.00,
                  "reasoning": "Plain English merchandising rationale."
                }
                """,
                    product.getSku(), product.getName(), product.getCategory(),
                    product.getCurrentPrice(), product.getStockLevel(), product.getReorderThreshold(),
                    product.getDemandVelocity(), categoryAvgVelocity);
        }
    }

    private String buildReorderPrompt(Product product, double categoryAvgVelocity, TriggerReason triggerReason) {
        return String.format("""
            Scenario: INVENTORY REPLENISHMENT ADVICE (%s)
            Product Details:
            - SKU: %s
            - Name: %s
            - Category: %s
            - Current Stock: %d units
            - Reorder Threshold: %d units
            - 24h Demand Velocity: %d units sold
            - Category Average Velocity: %.1f units sold

            Goal:
            Determine recommended reorder batch quantity and supplier lead time (in days).
            Balance holding costs against stockout risk during replenishment lead time.
            Target safety buffer is typically 3x to 4x reorder threshold depending on velocity burn rate.

            Provide your recommendation in strict JSON format:
            {
              "recommendedQuantity": 100,
              "suggestedLeadTimeDays": 5,
              "confidence": 0.00,
              "reasoning": "Plain English explanation of burn rate coverage and lead time buffer."
            }
            """,
                triggerReason, product.getSku(), product.getName(), product.getCategory(),
                product.getStockLevel(), product.getReorderThreshold(),
                product.getDemandVelocity(), categoryAvgVelocity);
    }

    // --- SANITY BOUNDS & VALIDATION ---

    private BigDecimal parseAndValidatePrice(JsonNode root, BigDecimal currentPrice) {
        double rawPrice = root.path("recommendedPrice").asDouble(-1.0);
        if (rawPrice <= 0.0) {
            throw new IllegalArgumentException("Invalid negative or zero recommended price from LLM: " + rawPrice);
        }

        BigDecimal price = BigDecimal.valueOf(rawPrice).setScale(2, RoundingMode.HALF_UP);
        BigDecimal minSanityBound = currentPrice.multiply(BigDecimal.valueOf(0.30)); // Max 70% drop
        BigDecimal maxSanityBound = currentPrice.multiply(BigDecimal.valueOf(3.00)); // Max 300% increase

        if (price.compareTo(minSanityBound) < 0 || price.compareTo(maxSanityBound) > 0) {
            log.warn("LLM price ${} exceeded sane bounds [${}, ${}]. Clamping to safe boundary.",
                    price, minSanityBound, maxSanityBound);
            if (price.compareTo(minSanityBound) < 0) return minSanityBound.setScale(2, RoundingMode.HALF_UP);
            return maxSanityBound.setScale(2, RoundingMode.HALF_UP);
        }

        return price;
    }

    private int parseAndValidateQuantity(JsonNode root, Product product) {
        int qty = root.path("recommendedQuantity").asInt(-1);
        if (qty <= 0) {
            // Compute deterministic minimum fallback
            return Math.max(1, (product.getReorderThreshold() * 3) - product.getStockLevel());
        }
        // Guard against absurd quantities
        return Math.min(qty, 5000);
    }

    private PriceDirection parseDirection(JsonNode root, BigDecimal currentPrice, BigDecimal recommendedPrice) {
        String dir = root.path("direction").asText("");
        try {
            return PriceDirection.valueOf(dir.toUpperCase());
        } catch (Exception e) {
            int comp = recommendedPrice.compareTo(currentPrice);
            if (comp > 0) return PriceDirection.INCREASE;
            if (comp < 0) return PriceDirection.DECREASE;
            return PriceDirection.HOLD;
        }
    }

    private Double parseConfidence(JsonNode root) {
        double conf = root.path("confidence").asDouble(0.85);
        if (conf < 0.0 || conf > 1.0) {
            return 0.85;
        }
        return conf;
    }
}
