package com.stockpulse;

import com.stockpulse.dto.PricingRecommendationDto;
import com.stockpulse.dto.ReorderRecommendationDto;
import com.stockpulse.engine.RuleBasedPricingStrategy;
import com.stockpulse.engine.RuleBasedReorderStrategy;
import com.stockpulse.model.PriceDirection;
import com.stockpulse.model.Product;
import com.stockpulse.model.ProductCategory;
import com.stockpulse.model.ProductStatus;
import com.stockpulse.model.TriggerReason;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

public class CommerceStrategyTest {

    private RuleBasedPricingStrategy pricingStrategy;
    private RuleBasedReorderStrategy reorderStrategy;

    @BeforeEach
    void setUp() {
        pricingStrategy = new RuleBasedPricingStrategy();
        reorderStrategy = new RuleBasedReorderStrategy();
    }

    @Test
    @DisplayName("T-2: When stock is below reorder threshold, pricing strategy recommends +10% price increase")
    void testPricingStrategyLowInventory() {
        Product product = Product.builder()
                .id("TEST-01")
                .sku("SKU-TEST-01")
                .name("Low Stock Widget")
                .category(ProductCategory.ELECTRONICS)
                .currentPrice(new BigDecimal("100.00"))
                .stockLevel(5) // Below threshold 10
                .reorderThreshold(10)
                .demandVelocity(2)
                .status(ProductStatus.ACTIVE)
                .build();

        PricingRecommendationDto rec = pricingStrategy.evaluatePricing(product, 2.0, TriggerReason.INVENTORY_LOW);

        assertNotNull(rec);
        assertEquals(new BigDecimal("110.00"), rec.getRecommendedPrice());
        assertEquals(PriceDirection.INCREASE, rec.getDirection());
        assertTrue(rec.getReasoning().contains("critically below reorder threshold"));
    }

    @Test
    @DisplayName("T-2: When velocity exceeds 2x category average, pricing strategy recommends +5% price increase")
    void testPricingStrategyDemandSpike() {
        Product product = Product.builder()
                .id("TEST-02")
                .sku("SKU-TEST-02")
                .name("Trending Sneaker")
                .category(ProductCategory.APPAREL)
                .currentPrice(new BigDecimal("200.00"))
                .stockLevel(50) // Healthy stock
                .reorderThreshold(10)
                .demandVelocity(15) // > 2 * 5.0 (category average)
                .status(ProductStatus.ACTIVE)
                .build();

        PricingRecommendationDto rec = pricingStrategy.evaluatePricing(product, 5.0, TriggerReason.DEMAND_SPIKE);

        assertNotNull(rec);
        assertEquals(new BigDecimal("210.00"), rec.getRecommendedPrice());
        assertEquals(PriceDirection.INCREASE, rec.getDirection());
        assertTrue(rec.getReasoning().contains("2x category average"));
    }

    @Test
    @DisplayName("T-2: When stock and demand are normal, pricing strategy recommends HOLD")
    void testPricingStrategyHold() {
        Product product = Product.builder()
                .id("TEST-03")
                .sku("SKU-TEST-03")
                .name("Stable Coffee Mug")
                .category(ProductCategory.HOME)
                .currentPrice(new BigDecimal("25.00"))
                .stockLevel(40)
                .reorderThreshold(10)
                .demandVelocity(3)
                .status(ProductStatus.ACTIVE)
                .build();

        PricingRecommendationDto rec = pricingStrategy.evaluatePricing(product, 3.0, TriggerReason.MANUAL);

        assertNotNull(rec);
        assertEquals(new BigDecimal("25.00"), rec.getRecommendedPrice());
        assertEquals(PriceDirection.HOLD, rec.getDirection());
    }

    @Test
    @DisplayName("T-2: Reorder formula calculates (threshold * 3) - stockLevel, min 1")
    void testReorderStrategyFormula() {
        Product product = Product.builder()
                .id("TEST-04")
                .sku("SKU-TEST-04")
                .name("Reorder Test Item")
                .category(ProductCategory.ELECTRONICS)
                .currentPrice(new BigDecimal("50.00"))
                .stockLevel(8)
                .reorderThreshold(15) // target = 45, expected qty = 45 - 8 = 37
                .demandVelocity(4)
                .status(ProductStatus.ACTIVE)
                .build();

        ReorderRecommendationDto rec = reorderStrategy.evaluateReorder(product, 4.0, TriggerReason.INVENTORY_LOW);

        assertNotNull(rec);
        assertEquals(37, rec.getRecommendedQuantity());
        assertEquals(5, rec.getSuggestedLeadTimeDays());
        assertTrue(rec.getReasoning().contains("37 units replenishment"));
    }
}
