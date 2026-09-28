package com.stockpulse.service;

import com.stockpulse.agent.InventorySignalEvent;
import com.stockpulse.dto.*;
import com.stockpulse.engine.StrategyRegistry;
import com.stockpulse.model.*;
import com.stockpulse.repository.InventorySnapshotRepository;
import com.stockpulse.repository.PricingSuggestionRepository;
import com.stockpulse.repository.ProductRepository;
import com.stockpulse.repository.ReorderSuggestionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final PricingSuggestionRepository pricingSuggestionRepository;
    private final ReorderSuggestionRepository reorderSuggestionRepository;
    private final InventorySnapshotRepository inventorySnapshotRepository;
    private final StrategyRegistry strategyRegistry;
    private final ApplicationEventPublisher eventPublisher;

    public ProductService(
            ProductRepository productRepository,
            PricingSuggestionRepository pricingSuggestionRepository,
            ReorderSuggestionRepository reorderSuggestionRepository,
            InventorySnapshotRepository inventorySnapshotRepository,
            StrategyRegistry strategyRegistry,
            ApplicationEventPublisher eventPublisher
    ) {
        this.productRepository = productRepository;
        this.pricingSuggestionRepository = pricingSuggestionRepository;
        this.reorderSuggestionRepository = reorderSuggestionRepository;
        this.inventorySnapshotRepository = inventorySnapshotRepository;
        this.strategyRegistry = strategyRegistry;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Product createProduct(CreateProductRequest request) {
        String id = (request.getId() != null && !request.getId().isBlank())
                ? request.getId()
                : "PRD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Product product = Product.builder()
                .id(id)
                .sku(request.getSku())
                .name(request.getName())
                .category(request.getCategory())
                .currentPrice(request.getCurrentPrice())
                .stockLevel(request.getStockLevel())
                .reorderThreshold(request.getReorderThreshold())
                .demandVelocity(request.getDemandVelocity() != null ? request.getDemandVelocity() : 0)
                .costPrice(request.getCostPrice())
                .marginFloor(request.getMarginFloor())
                .supplierId(request.getSupplierId())
                .build();

        Product saved = productRepository.save(product);
        recordSnapshot(saved, "PRODUCT_CREATED");
        log.info("Created product [{}] SKU [{}]", saved.getId(), saved.getSku());
        return saved;
    }

    public List<Product> getProducts(ProductCategory category, ProductStatus status) {
        if (category != null && status != null) {
            return productRepository.findByCategoryAndStatus(category, status);
        } else if (category != null) {
            return productRepository.findByCategory(category);
        } else if (status != null) {
            return productRepository.findByStatus(status);
        }
        return productRepository.findAllByOrderByCategoryAscNameAsc();
    }

    public Product getProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));
    }

    public List<ProductDetailDto> getAllProductDetails(ProductCategory category, ProductStatus status) {
        List<Product> products = getProducts(category, status);
        return products.stream()
                .map(this::enrichProductDetail)
                .collect(Collectors.toList());
    }

    public ProductDetailDto getProductDetail(String id) {
        Product product = getProductById(id);
        return enrichProductDetail(product);
    }

    /**
     * Updates product stock level.
     * Fires asynchronous InventorySignalEvent to evaluate agentic recommendations.
     */
    @Transactional
    public Product updateStock(String id, int newStock) {
        Product product = getProductById(id);
        int oldStock = product.getStockLevel();
        int oldVelocity = product.getDemandVelocity();

        product.updateStock(newStock);
        Product saved = productRepository.save(product);

        recordSnapshot(saved, "STOCK_UPDATE");

        // Fire asynchronous agentic loop event
        eventPublisher.publishEvent(InventorySignalEvent.builder()
                .productId(saved.getId())
                .oldStock(oldStock)
                .newStock(saved.getStockLevel())
                .oldVelocity(oldVelocity)
                .newVelocity(saved.getDemandVelocity())
                .source("STOCK_UPDATE")
                .build());

        log.info("Stock updated for SKU [{}]: {} -> {}. Agentic event published.",
                saved.getSku(), oldStock, saved.getStockLevel());

        return saved;
    }

    /**
     * Simulates customer order (decrements stock, increments 24h demand velocity).
     * Fires asynchronous InventorySignalEvent to evaluate agentic recommendations.
     */
    @Transactional
    public Product simulateOrder(String id, int quantity) {
        Product product = getProductById(id);
        int oldStock = product.getStockLevel();
        int oldVelocity = product.getDemandVelocity();

        product.recordOrder(quantity);
        Product saved = productRepository.save(product);

        recordSnapshot(saved, "SIMULATE_ORDER");

        // Fire asynchronous agentic loop event
        eventPublisher.publishEvent(InventorySignalEvent.builder()
                .productId(saved.getId())
                .oldStock(oldStock)
                .newStock(saved.getStockLevel())
                .oldVelocity(oldVelocity)
                .newVelocity(saved.getDemandVelocity())
                .source("ORDER_SALE")
                .build());

        log.info("Simulated order of {} units on SKU [{}]: Remaining stock {}, Velocity {}. Agentic event published.",
                quantity, saved.getSku(), saved.getStockLevel(), saved.getDemandVelocity());

        return saved;
    }

    /**
     * On-demand pricing suggestion endpoint.
     */
    @Transactional
    public PricingSuggestion suggestPricingOnDemand(String id) {
        Product product = getProductById(id);
        double categoryAvg = productRepository.findAverageVelocityByCategory(product.getCategory());

        PricingRecommendationDto rec = strategyRegistry.getPricingStrategy()
                .evaluatePricing(product, categoryAvg, TriggerReason.MANUAL);

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
        return saved;
    }

    /**
     * On-demand reorder suggestion endpoint.
     */
    @Transactional
    public ReorderSuggestion suggestReorderOnDemand(String id) {
        Product product = getProductById(id);
        double categoryAvg = productRepository.findAverageVelocityByCategory(product.getCategory());

        ReorderRecommendationDto rec = strategyRegistry.getReorderStrategy()
                .evaluateReorder(product, categoryAvg, TriggerReason.MANUAL);

        ReorderSuggestion suggestion = ReorderSuggestion.builder()
                .product(product)
                .currentStock(product.getStockLevel())
                .recommendedQuantity(rec.getRecommendedQuantity())
                .suggestedLeadTimeDays(rec.getSuggestedLeadTimeDays())
                .confidence(rec.getConfidence())
                .reasoning(rec.getReasoning())
                .status(SuggestionStatus.PENDING)
                .triggerReason(TriggerReason.MANUAL)
                .build();

        return reorderSuggestionRepository.save(suggestion);
    }

    private ProductDetailDto enrichProductDetail(Product product) {
        double categoryAvg = productRepository.findAverageVelocityByCategory(product.getCategory());

        List<PricingSuggestion> pricingSuggestions = pricingSuggestionRepository
                .findByProductIdAndStatus(product.getId(), SuggestionStatus.PENDING);
        List<ReorderSuggestion> reorderSuggestions = reorderSuggestionRepository
                .findByProductIdAndStatus(product.getId(), SuggestionStatus.PENDING);

        String health;
        if (product.getStockLevel() == 0) {
            health = "CRITICAL_OUT";
        } else if (product.getStockLevel() < product.getReorderThreshold()) {
            health = "LOW_ALERT";
        } else if (product.getStockLevel() < (product.getReorderThreshold() * 1.5)) {
            health = "WATCH";
        } else {
            health = "HEALTHY";
        }

        return ProductDetailDto.builder()
                .product(product)
                .categoryAvgVelocity(categoryAvg)
                .pendingPricingSuggestion(pricingSuggestions.isEmpty() ? null : pricingSuggestions.get(0))
                .pendingReorderSuggestion(reorderSuggestions.isEmpty() ? null : reorderSuggestions.get(0))
                .stockHealth(health)
                .build();
    }

    private void recordSnapshot(Product product, String eventType) {
        InventorySnapshot snapshot = InventorySnapshot.builder()
                .product(product)
                .stockLevel(product.getStockLevel())
                .demandVelocity(product.getDemandVelocity())
                .price(product.getCurrentPrice())
                .eventType(eventType)
                .build();
        inventorySnapshotRepository.save(snapshot);
    }
}
