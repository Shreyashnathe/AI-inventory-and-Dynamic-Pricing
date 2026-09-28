package com.stockpulse.engine;

import com.stockpulse.dto.PricingRecommendationDto;
import com.stockpulse.model.PriceDirection;
import com.stockpulse.model.Product;
import com.stockpulse.model.TriggerReason;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component("ruleBasedPricingStrategy")
public class RuleBasedPricingStrategy implements PricingStrategy {

    @Override
    public PricingRecommendationDto evaluatePricing(Product product, double categoryAvgVelocity, TriggerReason triggerReason) {
        BigDecimal currentPrice = product.getCurrentPrice();
        int stock = product.getStockLevel();
        int threshold = product.getReorderThreshold();
        int velocity = product.getDemandVelocity();

        // Rule 1: Stock below reorder threshold -> 10% price increase to conserve inventory
        if (stock < threshold) {
            BigDecimal recommendedPrice = currentPrice.multiply(BigDecimal.valueOf(1.10))
                    .setScale(2, RoundingMode.HALF_UP);
            return PricingRecommendationDto.builder()
                    .recommendedPrice(recommendedPrice)
                    .direction(PriceDirection.INCREASE)
                    .confidence(0.85)
                    .reasoning(String.format(
                            "Rule-Based Pricing: Current stock (%d units) is critically below reorder threshold (%d units). " +
                            "A 10%% price increase from $%s to $%s is recommended to slow demand velocity and prevent stockout.",
                            stock, threshold, currentPrice, recommendedPrice))
                    .build();
        }

        // Rule 2: Demand velocity > 2x category average -> 5% price increase to capture margin
        if (categoryAvgVelocity > 0 && velocity > (categoryAvgVelocity * 2.0)) {
            BigDecimal recommendedPrice = currentPrice.multiply(BigDecimal.valueOf(1.05))
                    .setScale(2, RoundingMode.HALF_UP);
            return PricingRecommendationDto.builder()
                    .recommendedPrice(recommendedPrice)
                    .direction(PriceDirection.INCREASE)
                    .confidence(0.80)
                    .reasoning(String.format(
                            "Rule-Based Pricing: 24h demand velocity (%d orders) is surging past 2x category average (%.1f orders). " +
                            "A 5%% price increase from $%s to $%s is recommended to capitalize on momentum.",
                            velocity, categoryAvgVelocity, currentPrice, recommendedPrice))
                    .build();
        }

        // Rule 3: Balanced stock & velocity -> HOLD current price
        return PricingRecommendationDto.builder()
                .recommendedPrice(currentPrice)
                .direction(PriceDirection.HOLD)
                .confidence(0.90)
                .reasoning(String.format(
                        "Rule-Based Pricing: Inventory level (%d units) and velocity (%d orders/24h vs category avg %.1f) are stable. " +
                        "Maintaining current price at $%s.",
                        stock, velocity, categoryAvgVelocity, currentPrice))
                .build();
    }

    @Override
    public String getStrategyName() {
        return "Deterministic Rule-Based Engine (v1.0)";
    }
}
