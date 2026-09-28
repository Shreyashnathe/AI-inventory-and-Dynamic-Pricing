package com.stockpulse.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @Column(nullable = false, unique = true, length = 64)
    private String id;

    @Column(nullable = false, unique = true, length = 64)
    private String sku;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ProductCategory category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal currentPrice;

    @Column(nullable = false)
    private Integer stockLevel;

    @Column(nullable = false)
    private Integer reorderThreshold;

    @Column(nullable = false)
    private Integer demandVelocity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ProductStatus status;

    // --- SPRINT 2 EXTENSION SEAM ---
    // Nullable extension fields explicitly modeled for Sprint 2 competitor pricing, margin floors & supplier integration
    @Column(precision = 10, scale = 2)
    private BigDecimal costPrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal marginFloor;

    @Column(length = 64)
    private String supplierId;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.status == null) {
            this.status = (this.stockLevel != null && this.stockLevel == 0)
                    ? ProductStatus.OUT_OF_STOCK
                    : ProductStatus.ACTIVE;
        }
        if (this.demandVelocity == null) {
            this.demandVelocity = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // --- DOMAIN BEHAVIORS ---

    /**
     * Record a customer sale: decrements stock and increments 24h demand velocity.
     * Transitions to OUT_OF_STOCK when remaining stock reaches zero.
     */
    public void recordOrder(int quantity) {
        if (quantity <= 0) return;
        this.stockLevel = Math.max(0, this.stockLevel - quantity);
        this.demandVelocity += quantity;
        if (this.stockLevel == 0) {
            this.status = ProductStatus.OUT_OF_STOCK;
        }
    }

    /**
     * Updates current stock level from external inventory adjustment.
     */
    public void updateStock(int newStock) {
        int oldStock = this.stockLevel;
        this.stockLevel = Math.max(0, newStock);
        if (this.stockLevel == 0) {
            this.status = ProductStatus.OUT_OF_STOCK;
        } else if (oldStock == 0 && this.stockLevel > 0 && this.status == ProductStatus.OUT_OF_STOCK) {
            this.status = ProductStatus.ACTIVE;
        }
    }

    /**
     * Applies reorder arrival (simulated inbound shipment).
     */
    public void addStock(int quantity) {
        if (quantity <= 0) return;
        this.stockLevel += quantity;
        if (this.status == ProductStatus.OUT_OF_STOCK) {
            this.status = ProductStatus.ACTIVE;
        }
    }

    /**
     * Applies an approved pricing suggestion.
     */
    public void applyNewPrice(BigDecimal newPrice) {
        if (newPrice != null && newPrice.compareTo(BigDecimal.ZERO) > 0) {
            this.currentPrice = newPrice;
        }
    }
}
