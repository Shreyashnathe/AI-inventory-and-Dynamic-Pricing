package com.stockpulse.service;

import com.stockpulse.model.*;
import com.stockpulse.repository.PricingSuggestionRepository;
import com.stockpulse.repository.ProductRepository;
import com.stockpulse.repository.ReorderSuggestionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SuggestionService {

    private static final Logger log = LoggerFactory.getLogger(SuggestionService.class);

    private final PricingSuggestionRepository pricingSuggestionRepository;
    private final ReorderSuggestionRepository reorderSuggestionRepository;
    private final ProductRepository productRepository;

    public SuggestionService(
            PricingSuggestionRepository pricingSuggestionRepository,
            ReorderSuggestionRepository reorderSuggestionRepository,
            ProductRepository productRepository
    ) {
        this.pricingSuggestionRepository = pricingSuggestionRepository;
        this.reorderSuggestionRepository = reorderSuggestionRepository;
        this.productRepository = productRepository;
    }

    public List<PricingSuggestion> getPricingSuggestions(SuggestionStatus status) {
        if (status != null) {
            return pricingSuggestionRepository.findByStatusOrderByCreatedAtDesc(status);
        }
        return pricingSuggestionRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<ReorderSuggestion> getReorderSuggestions(SuggestionStatus status) {
        if (status != null) {
            return reorderSuggestionRepository.findByStatusOrderByCreatedAtDesc(status);
        }
        return reorderSuggestionRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Action a pricing suggestion (ACCEPT or REJECT).
     * Accepting updates Product.currentPrice atomically.
     * Evaluates remaining pending suggestions to restore Product.status to ACTIVE.
     */
    @Transactional
    public PricingSuggestion actionPricingSuggestion(Long id, SuggestionStatus action) {
        PricingSuggestion suggestion = pricingSuggestionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pricing suggestion not found: " + id));

        if (suggestion.getStatus() != SuggestionStatus.PENDING) {
            throw new IllegalStateException("Suggestion has already been actioned: " + suggestion.getStatus());
        }

        suggestion.setStatus(action);
        PricingSuggestion saved = pricingSuggestionRepository.save(suggestion);
        Product product = suggestion.getProduct();

        if (action == SuggestionStatus.ACCEPTED) {
            log.info("Pricing suggestion [{}] ACCEPTED for SKU [{}]. Updating price ${} -> ${}",
                    id, product.getSku(), product.getCurrentPrice(), suggestion.getRecommendedPrice());
            product.applyNewPrice(suggestion.getRecommendedPrice());
        } else {
            log.info("Pricing suggestion [{}] REJECTED for SKU [{}]", id, product.getSku());
        }

        reconcileProductLifecycle(product);
        return saved;
    }

    /**
     * Action a reorder replenishment suggestion (ACCEPT or REJECT).
     * Accepting increments Product.stockLevel (simulating inbound shipment arrival).
     * Reconciles Product.status if product was OUT_OF_STOCK or PRICE_REVIEW_PENDING.
     */
    @Transactional
    public ReorderSuggestion actionReorderSuggestion(Long id, SuggestionStatus action) {
        ReorderSuggestion suggestion = reorderSuggestionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reorder suggestion not found: " + id));

        if (suggestion.getStatus() != SuggestionStatus.PENDING) {
            throw new IllegalStateException("Suggestion has already been actioned: " + suggestion.getStatus());
        }

        suggestion.setStatus(action);
        ReorderSuggestion saved = reorderSuggestionRepository.save(suggestion);
        Product product = suggestion.getProduct();

        if (action == SuggestionStatus.ACCEPTED) {
            log.info("Reorder suggestion [{}] ACCEPTED for SKU [{}]. Adding {} units to stock (inbound shipment).",
                    id, product.getSku(), suggestion.getRecommendedQuantity());
            product.addStock(suggestion.getRecommendedQuantity());
        } else {
            log.info("Reorder suggestion [{}] REJECTED for SKU [{}]", id, product.getSku());
        }

        reconcileProductLifecycle(product);
        return saved;
    }

    private void reconcileProductLifecycle(Product product) {
        long pendingPricing = pricingSuggestionRepository.countByProductIdAndStatus(product.getId(), SuggestionStatus.PENDING);
        long pendingReorder = reorderSuggestionRepository.countByProductIdAndStatus(product.getId(), SuggestionStatus.PENDING);

        if (product.getStockLevel() == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (pendingPricing == 0 && pendingReorder == 0) {
            product.setStatus(ProductStatus.ACTIVE);
        } else {
            product.setStatus(ProductStatus.PRICE_REVIEW_PENDING);
        }

        productRepository.save(product);
        log.info("Product [{}] lifecycle reconciled to [{}]", product.getSku(), product.getStatus());
    }
}
