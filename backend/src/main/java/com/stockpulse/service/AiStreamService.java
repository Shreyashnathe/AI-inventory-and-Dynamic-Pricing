package com.stockpulse.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockpulse.ai.AiCommerceAdvisor;
import com.stockpulse.dto.PricingRecommendationDto;
import com.stockpulse.model.*;
import com.stockpulse.repository.PricingSuggestionRepository;
import com.stockpulse.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.CompletableFuture;

@Service
public class AiStreamService {

    private static final Logger log = LoggerFactory.getLogger(AiStreamService.class);

    private final ProductRepository productRepository;
    private final PricingSuggestionRepository pricingSuggestionRepository;
    private final AiCommerceAdvisor aiAdvisor;
    private final ObjectMapper objectMapper;

    public AiStreamService(
            ProductRepository productRepository,
            PricingSuggestionRepository pricingSuggestionRepository,
            AiCommerceAdvisor aiAdvisor,
            ObjectMapper objectMapper
    ) {
        this.productRepository = productRepository;
        this.pricingSuggestionRepository = pricingSuggestionRepository;
        this.aiAdvisor = aiAdvisor;
        this.objectMapper = objectMapper;
    }

    public SseEmitter streamPricingRecommendation(String productId) {
        SseEmitter emitter = new SseEmitter(60_000L); // 60s timeout

        CompletableFuture.runAsync(() -> {
            try {
                Product product = productRepository.findById(productId)
                        .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));

                double categoryAvg = productRepository.findAverageVelocityByCategory(product.getCategory());

                emitEvent(emitter, "init", "Initializing StockPulse AI Neural Reasoning Session for SKU: " + product.getSku());
                Thread.sleep(300);

                emitEvent(emitter, "analysis", String.format(
                        "Context: Price=$%s | Stock=%d | Threshold=%d | 24h Velocity=%d (Category Avg=%.1f)",
                        product.getCurrentPrice(), product.getStockLevel(), product.getReorderThreshold(),
                        product.getDemandVelocity(), categoryAvg));
                Thread.sleep(400);

                emitEvent(emitter, "thought", "Synthesizing elasticity curve and inventory scarcity matrix...");
                Thread.sleep(400);

                // Run AI Evaluation
                PricingRecommendationDto rec = aiAdvisor.evaluatePricing(product, categoryAvg, TriggerReason.MANUAL);

                // Stream the reasoning tokens in words
                String[] words = rec.getReasoning().split(" ");
                for (String word : words) {
                    emitEvent(emitter, "token", word + " ");
                    Thread.sleep(30);
                }

                // Persist the suggestion
                PricingSuggestion suggestion = PricingSuggestion.builder()
                        .product(product)
                        .currentPrice(product.getCurrentPrice())
                        .recommendedPrice(rec.getRecommendedPrice())
                        .changeDirection(rec.getDirection())
                        .confidence(rec.getConfidence())
                        .reasoning(rec.getReasoning())
                        .status(SuggestionStatus.PENDING)
                        .triggerReason(TriggerReason.MANUAL)
                        .build();

                PricingSuggestion saved = pricingSuggestionRepository.save(suggestion);

                if (product.getStatus() == ProductStatus.ACTIVE && product.getStockLevel() > 0) {
                    product.setStatus(ProductStatus.PRICE_REVIEW_PENDING);
                    productRepository.save(product);
                }

                emitEvent(emitter, "result", objectMapper.writeValueAsString(saved));
                emitEvent(emitter, "complete", "AI Strategic Recommendation complete.");

                emitter.complete();
            } catch (Exception e) {
                log.error("SSE stream error: {}", e.getMessage(), e);
                try {
                    emitEvent(emitter, "error", "Streaming failed: " + e.getMessage());
                } catch (Exception ignored) {}
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    private void emitEvent(SseEmitter emitter, String name, String data) throws IOException {
        emitter.send(SseEmitter.event().name(name).data(data));
    }
}
