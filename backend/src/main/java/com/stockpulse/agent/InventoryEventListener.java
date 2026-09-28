package com.stockpulse.agent;

import com.stockpulse.dto.PricingRecommendationDto;
import com.stockpulse.dto.ReorderRecommendationDto;
import com.stockpulse.engine.StrategyRegistry;
import com.stockpulse.model.*;
import com.stockpulse.repository.PricingSuggestionRepository;
import com.stockpulse.repository.ProductRepository;
import com.stockpulse.repository.ReorderSuggestionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class InventoryEventListener {

    private static final Logger log = LoggerFactory.getLogger(InventoryEventListener.class);

    private final ProductRepository productRepository;
    private final PricingSuggestionRepository pricingSuggestionRepository;
    private final ReorderSuggestionRepository reorderSuggestionRepository;
    private final StrategyRegistry strategyRegistry;
    private final double spikeMultiplier;

    public InventoryEventListener(
            ProductRepository productRepository,
            PricingSuggestionRepository pricingSuggestionRepository,
            ReorderSuggestionRepository reorderSuggestionRepository,
            StrategyRegistry strategyRegistry,
            @Value("${commerce.agent.spike-multiplier:3.0}") double spikeMultiplier
    ) {
        this.productRepository = productRepository;
        this.pricingSuggestionRepository = pricingSuggestionRepository;
        this.reorderSuggestionRepository = reorderSuggestionRepository;
        this.strategyRegistry = strategyRegistry;
        this.spikeMultiplier = spikeMultiplier;
    }

    /**
     * Fully asynchronous agentic recommendation loop.
     * Uses @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
     * to eliminate transaction race conditions, ensuring the async thread evaluates
     * committed inventory numbers.
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onInventorySignal(InventorySignalEvent event) {
        try {
            log.info("Agentic Loop [AFTER_COMMIT]: Processing InventorySignalEvent for Product ID [{}], Source: [{}], NewStock: {}, NewVelocity: {}",
                    event.getProductId(), event.getSource(), event.getNewStock(), event.getNewVelocity());

            Product product = productRepository.findById(event.getProductId()).orElse(null);
            if (product == null) {
                log.warn("Agentic Loop: Product [{}] not found. Aborting recommendation run.", event.getProductId());
                return;
            }

            double categoryAvgVelocity = productRepository.findAverageVelocityByCategory(product.getCategory());
            log.info("Agentic Loop: SKU [{}] (Stock: {}, Threshold: {}, Velocity: {}) vs Category [{}] Avg Velocity: {}",
                    product.getSku(), product.getStockLevel(), product.getReorderThreshold(),
                    product.getDemandVelocity(), product.getCategory(), categoryAvgVelocity);

            boolean triggerFired = false;

            // --- TRIGGER A: INVENTORY LOW ---
            if (product.getStockLevel() < product.getReorderThreshold()) {
                log.info("Agentic Loop [TRIGGER A]: Stock ({}) < Threshold ({}) for SKU [{}]",
                        product.getStockLevel(), product.getReorderThreshold(), product.getSku());

                // Idempotency check: Skip if pending suggestions for INVENTORY_LOW already exist
                boolean hasPendingPricing = pricingSuggestionRepository.existsByProductIdAndStatusAndTriggerReason(
                        product.getId(), SuggestionStatus.PENDING, TriggerReason.INVENTORY_LOW);
                boolean hasPendingReorder = reorderSuggestionRepository.existsByProductIdAndStatusAndTriggerReason(
                        product.getId(), SuggestionStatus.PENDING, TriggerReason.INVENTORY_LOW);

                if (!hasPendingPricing) {
                    PricingRecommendationDto pricingRec = strategyRegistry.getPricingStrategy()
                            .evaluatePricing(product, categoryAvgVelocity, TriggerReason.INVENTORY_LOW);

                    PricingSuggestion pricingSuggestion = PricingSuggestion.builder()
                            .product(product)
                            .currentPrice(product.getCurrentPrice())
                            .recommendedPrice(pricingRec.getRecommendedPrice())
                            .changeDirection(pricingRec.getDirection())
                            .confidence(pricingRec.getConfidence())
                            .reasoning(pricingRec.getReasoning())
                            .status(SuggestionStatus.PENDING)
                            .triggerReason(TriggerReason.INVENTORY_LOW)
                            .build();

                    pricingSuggestionRepository.save(pricingSuggestion);
                    log.info("Agentic Loop: Successfully queued PricingSuggestion [{}] for SKU [{}]",
                            pricingSuggestion.getId(), product.getSku());
                    triggerFired = true;
                } else {
                    log.info("Agentic Loop: Skipped duplicate PENDING INVENTORY_LOW pricing suggestion for SKU [{}]",
                            product.getSku());
                }

                if (!hasPendingReorder) {
                    ReorderRecommendationDto reorderRec = strategyRegistry.getReorderStrategy()
                            .evaluateReorder(product, categoryAvgVelocity, TriggerReason.INVENTORY_LOW);

                    ReorderSuggestion reorderSuggestion = ReorderSuggestion.builder()
                            .product(product)
                            .currentStock(product.getStockLevel())
                            .recommendedQuantity(reorderRec.getRecommendedQuantity())
                            .suggestedLeadTimeDays(reorderRec.getSuggestedLeadTimeDays())
                            .confidence(reorderRec.getConfidence())
                            .reasoning(reorderRec.getReasoning())
                            .status(SuggestionStatus.PENDING)
                            .triggerReason(TriggerReason.INVENTORY_LOW)
                            .build();

                    reorderSuggestionRepository.save(reorderSuggestion);
                    log.info("Agentic Loop: Successfully queued ReorderSuggestion [{}] for SKU [{}]",
                            reorderSuggestion.getId(), product.getSku());
                    triggerFired = true;
                } else {
                    log.info("Agentic Loop: Skipped duplicate PENDING INVENTORY_LOW reorder suggestion for SKU [{}]",
                            product.getSku());
                }
            }

            // --- TRIGGER B: DEMAND SPIKE ---
            if (categoryAvgVelocity > 0 && product.getDemandVelocity() >= (categoryAvgVelocity * spikeMultiplier)) {
                log.info("Agentic Loop [TRIGGER B]: Velocity ({}) >= {}x Category Avg ({}) for SKU [{}]",
                        product.getDemandVelocity(), spikeMultiplier, categoryAvgVelocity, product.getSku());

                // Idempotency check: Skip if pending suggestions for DEMAND_SPIKE already exist
                boolean hasPendingSpikePricing = pricingSuggestionRepository.existsByProductIdAndStatusAndTriggerReason(
                        product.getId(), SuggestionStatus.PENDING, TriggerReason.DEMAND_SPIKE);
                boolean hasPendingSpikeReorder = reorderSuggestionRepository.existsByProductIdAndStatusAndTriggerReason(
                        product.getId(), SuggestionStatus.PENDING, TriggerReason.DEMAND_SPIKE);

                if (!hasPendingSpikePricing) {
                    PricingRecommendationDto spikePricing = strategyRegistry.getPricingStrategy()
                            .evaluatePricing(product, categoryAvgVelocity, TriggerReason.DEMAND_SPIKE);

                    PricingSuggestion pricingSuggestion = PricingSuggestion.builder()
                            .product(product)
                            .currentPrice(product.getCurrentPrice())
                            .recommendedPrice(spikePricing.getRecommendedPrice())
                            .changeDirection(spikePricing.getDirection())
                            .confidence(spikePricing.getConfidence())
                            .reasoning(spikePricing.getReasoning())
                            .status(SuggestionStatus.PENDING)
                            .triggerReason(TriggerReason.DEMAND_SPIKE)
                            .build();

                    pricingSuggestionRepository.save(pricingSuggestion);
                    log.info("Agentic Loop: Successfully queued DEMAND_SPIKE PricingSuggestion [{}] for SKU [{}]",
                            pricingSuggestion.getId(), product.getSku());
                    triggerFired = true;
                }

                if (!hasPendingSpikeReorder) {
                    ReorderRecommendationDto spikeReorder = strategyRegistry.getReorderStrategy()
                            .evaluateReorder(product, categoryAvgVelocity, TriggerReason.DEMAND_SPIKE);

                    ReorderSuggestion reorderSuggestion = ReorderSuggestion.builder()
                            .product(product)
                            .currentStock(product.getStockLevel())
                            .recommendedQuantity(spikeReorder.getRecommendedQuantity())
                            .suggestedLeadTimeDays(spikeReorder.getSuggestedLeadTimeDays())
                            .confidence(spikeReorder.getConfidence())
                            .reasoning(spikeReorder.getReasoning())
                            .status(SuggestionStatus.PENDING)
                            .triggerReason(TriggerReason.DEMAND_SPIKE)
                            .build();

                    reorderSuggestionRepository.save(reorderSuggestion);
                    log.info("Agentic Loop: Successfully queued DEMAND_SPIKE ReorderSuggestion [{}] for SKU [{}]",
                            reorderSuggestion.getId(), product.getSku());
                    triggerFired = true;
                }
            }

            // Transition product lifecycle status to PRICE_REVIEW_PENDING if suggestions were created
            if (triggerFired && product.getStockLevel() > 0 && product.getStatus() == ProductStatus.ACTIVE) {
                product.setStatus(ProductStatus.PRICE_REVIEW_PENDING);
                productRepository.save(product);
                log.info("Agentic Loop: Product [{}] transitioned to PRICE_REVIEW_PENDING", product.getSku());
            }
        } catch (Throwable t) {
            log.error("Unhandled error in Agentic Recommendation Loop: {}", t.getMessage(), t);
        }
    }
}
