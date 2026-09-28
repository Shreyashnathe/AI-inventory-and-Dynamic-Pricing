package com.stockpulse.service;

import com.stockpulse.model.*;
import com.stockpulse.repository.InventorySnapshotRepository;
import com.stockpulse.repository.PricingSuggestionRepository;
import com.stockpulse.repository.ProductRepository;
import com.stockpulse.repository.ReorderSuggestionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final ProductRepository productRepository;
    private final PricingSuggestionRepository pricingSuggestionRepository;
    private final ReorderSuggestionRepository reorderSuggestionRepository;
    private final InventorySnapshotRepository inventorySnapshotRepository;

    public DataInitializer(
            ProductRepository productRepository,
            PricingSuggestionRepository pricingSuggestionRepository,
            ReorderSuggestionRepository reorderSuggestionRepository,
            InventorySnapshotRepository inventorySnapshotRepository
    ) {
        this.productRepository = productRepository;
        this.pricingSuggestionRepository = pricingSuggestionRepository;
        this.reorderSuggestionRepository = reorderSuggestionRepository;
        this.inventorySnapshotRepository = inventorySnapshotRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            seedDatabase();
        }
    }

    @Transactional
    public void resetDatabase() {
        log.info("Resetting database to Addendum A canonical state...");
        pricingSuggestionRepository.deleteAll();
        reorderSuggestionRepository.deleteAll();
        inventorySnapshotRepository.deleteAll();
        productRepository.deleteAll();
        seedDatabase();
    }

    @Transactional
    public void seedDatabase() {
        log.info("Seeding Addendum A benchmark products...");

        List<Product> products = List.of(
                Product.builder()
                        .id("PRD-001")
                        .sku("SKU-ELEC-001")
                        .name("Wireless Earbuds Pro")
                        .category(ProductCategory.ELECTRONICS)
                        .currentPrice(new BigDecimal("79.99"))
                        .stockLevel(45)
                        .reorderThreshold(20)
                        .demandVelocity(3)
                        .status(ProductStatus.ACTIVE)
                        .costPrice(new BigDecimal("35.00"))
                        .marginFloor(new BigDecimal("45.00"))
                        .supplierId("SUP-AUDIO-01")
                        .build(),
                Product.builder()
                        .id("PRD-002")
                        .sku("SKU-ELEC-002")
                        .name("USB-C Hub 7-Port")
                        .category(ProductCategory.ELECTRONICS)
                        .currentPrice(new BigDecimal("34.99"))
                        .stockLevel(120)
                        .reorderThreshold(30)
                        .demandVelocity(1)
                        .status(ProductStatus.ACTIVE)
                        .costPrice(new BigDecimal("12.50"))
                        .marginFloor(new BigDecimal("18.00"))
                        .supplierId("SUP-TECH-04")
                        .build(),
                Product.builder()
                        .id("PRD-003")
                        .sku("SKU-APP-001")
                        .name("Organic Cotton T-Shirt")
                        .category(ProductCategory.APPAREL)
                        .currentPrice(new BigDecimal("24.99"))
                        .stockLevel(8)
                        .reorderThreshold(15)
                        .demandVelocity(12)
                        .status(ProductStatus.PRICE_REVIEW_PENDING)
                        .costPrice(new BigDecimal("8.00"))
                        .marginFloor(new BigDecimal("14.00"))
                        .supplierId("SUP-TEX-02")
                        .build(),
                Product.builder()
                        .id("PRD-004")
                        .sku("SKU-APP-002")
                        .name("Running Shorts — Navy")
                        .category(ProductCategory.APPAREL)
                        .currentPrice(new BigDecimal("39.99"))
                        .stockLevel(55)
                        .reorderThreshold(20)
                        .demandVelocity(2)
                        .status(ProductStatus.ACTIVE)
                        .costPrice(new BigDecimal("14.00"))
                        .marginFloor(new BigDecimal("22.00"))
                        .supplierId("SUP-TEX-02")
                        .build(),
                Product.builder()
                        .id("PRD-005")
                        .sku("SKU-HOME-001")
                        .name("Ceramic Pour-Over Set")
                        .category(ProductCategory.HOME)
                        .currentPrice(new BigDecimal("49.99"))
                        .stockLevel(22)
                        .reorderThreshold(10)
                        .demandVelocity(4)
                        .status(ProductStatus.ACTIVE)
                        .costPrice(new BigDecimal("18.00"))
                        .marginFloor(new BigDecimal("28.00"))
                        .supplierId("SUP-HOME-09")
                        .build(),
                Product.builder()
                        .id("PRD-006")
                        .sku("SKU-HOME-002")
                        .name("LED Desk Lamp — Dimmable")
                        .category(ProductCategory.HOME)
                        .currentPrice(new BigDecimal("59.99"))
                        .stockLevel(0)
                        .reorderThreshold(15)
                        .demandVelocity(0)
                        .status(ProductStatus.OUT_OF_STOCK)
                        .costPrice(new BigDecimal("24.00"))
                        .marginFloor(new BigDecimal("35.00"))
                        .supplierId("SUP-HOME-09")
                        .build(),
                Product.builder()
                        .id("PRD-007")
                        .sku("SKU-ELEC-003")
                        .name("Portable Charger 20K")
                        .category(ProductCategory.ELECTRONICS)
                        .currentPrice(new BigDecimal("44.99"))
                        .stockLevel(18)
                        .reorderThreshold(25)
                        .demandVelocity(8)
                        .status(ProductStatus.ACTIVE)
                        .costPrice(new BigDecimal("19.00"))
                        .marginFloor(new BigDecimal("26.00"))
                        .supplierId("SUP-TECH-04")
                        .build(),
                Product.builder()
                        .id("PRD-008")
                        .sku("SKU-APP-003")
                        .name("Hoodie — Heather Grey")
                        .category(ProductCategory.APPAREL)
                        .currentPrice(new BigDecimal("54.99"))
                        .stockLevel(11)
                        .reorderThreshold(12)
                        .demandVelocity(15)
                        .status(ProductStatus.ACTIVE)
                        .costPrice(new BigDecimal("22.00"))
                        .marginFloor(new BigDecimal("32.00"))
                        .supplierId("SUP-TEX-02")
                        .build()
        );

        productRepository.saveAll(products);

        // Pre-seed pending recommendations for PRD-003 (already low stock in Addendum A)
        Product prd003 = productRepository.findById("PRD-003").orElse(null);
        if (prd003 != null) {
            PricingSuggestion initialPricing = PricingSuggestion.builder()
                    .product(prd003)
                    .currentPrice(prd003.getCurrentPrice())
                    .recommendedPrice(new BigDecimal("27.99"))
                    .changeDirection(PriceDirection.INCREASE)
                    .confidence(0.88)
                    .reasoning("Stock level (8 units) is below reorder threshold (15 units) with high demand velocity (12 orders/24h vs apparel avg). A 12% price increase protects remaining inventory buffer while supplier replenishment is initiated.")
                    .status(SuggestionStatus.PENDING)
                    .triggerReason(TriggerReason.INVENTORY_LOW)
                    .build();
            pricingSuggestionRepository.save(initialPricing);

            ReorderSuggestion initialReorder = ReorderSuggestion.builder()
                    .product(prd003)
                    .currentStock(prd003.getStockLevel())
                    .recommendedQuantity(37)
                    .suggestedLeadTimeDays(5)
                    .confidence(0.85)
                    .reasoning("Target buffer of 45 units (3x threshold) minus current stock of 8 units warrants an immediate replenishment PO of 37 units from supplier SUP-TEX-02.")
                    .status(SuggestionStatus.PENDING)
                    .triggerReason(TriggerReason.INVENTORY_LOW)
                    .build();
            reorderSuggestionRepository.save(initialReorder);
        }

        log.info("Addendum A seed complete. {} products, initial pending suggestions loaded.", products.size());
    }
}
