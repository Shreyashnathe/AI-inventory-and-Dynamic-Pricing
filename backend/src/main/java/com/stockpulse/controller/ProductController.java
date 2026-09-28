package com.stockpulse.controller;

import com.stockpulse.dto.*;
import com.stockpulse.model.*;
import com.stockpulse.service.AiStreamService;
import com.stockpulse.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping({"/api/products", "/products"})
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class ProductController {

    private final ProductService productService;
    private final AiStreamService aiStreamService;

    public ProductController(ProductService productService, AiStreamService aiStreamService) {
        this.productService = productService;
        this.aiStreamService = aiStreamService;
    }

    /**
     * POST /api/products
     * Create new product with initial stock and price.
     */
    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody CreateProductRequest request) {
        Product product = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    /**
     * GET /api/products?status=&category=
     * Filterable catalog list with enriched pending suggestions and velocity ratios.
     */
    @GetMapping
    public ResponseEntity<List<ProductDetailDto>> getProducts(
            @RequestParam(required = false) ProductCategory category,
            @RequestParam(required = false) ProductStatus status
    ) {
        List<ProductDetailDto> products = productService.getAllProductDetails(category, status);
        return ResponseEntity.ok(products);
    }

    /**
     * GET /api/products/{id}
     * Get single product detail.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailDto> getProductById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductDetail(id));
    }

    /**
     * PATCH /api/products/{id}/stock
     * Update stock level; fires agentic recommendation loop asynchronously if below threshold.
     */
    @PatchMapping("/{id}/stock")
    public ResponseEntity<Product> updateStock(
            @PathVariable String id,
            @Valid @RequestBody UpdateStockRequest request
    ) {
        Product updated = productService.updateStock(id, request.getStockLevel());
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/products/{id}/orders
     * Simulate a customer sale (decrements stock, bumps demand velocity).
     * Fires agentic loop on spike or low stock.
     */
    @PostMapping("/{id}/orders")
    public ResponseEntity<Product> simulateOrder(
            @PathVariable String id,
            @RequestBody(required = false) SimulateOrderRequest request
    ) {
        int qty = (request != null && request.getQuantity() != null) ? request.getQuantity() : 1;
        Product updated = productService.simulateOrder(id, qty);
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/products/{id}/suggest-pricing
     * On-demand pricing suggestion using active strategy.
     */
    @PostMapping("/{id}/suggest-pricing")
    public ResponseEntity<PricingSuggestion> suggestPricing(@PathVariable String id) {
        PricingSuggestion suggestion = productService.suggestPricingOnDemand(id);
        return ResponseEntity.ok(suggestion);
    }

    /**
     * POST /api/products/{id}/suggest-reorder
     * On-demand reorder replenishment suggestion using active strategy.
     */
    @PostMapping("/{id}/suggest-reorder")
    public ResponseEntity<ReorderSuggestion> suggestReorder(@PathVariable String id) {
        ReorderSuggestion suggestion = productService.suggestReorderOnDemand(id);
        return ResponseEntity.ok(suggestion);
    }

    /**
     * GET /api/products/{id}/suggest-pricing/stream
     * BONUS (+5 pts): Server-Sent Events (SSE) token stream of AI reasoning
     * prior to suggestion persistence.
     */
    @GetMapping(value = "/{id}/suggest-pricing/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamPricingSuggestion(@PathVariable String id) {
        return aiStreamService.streamPricingRecommendation(id);
    }
}
