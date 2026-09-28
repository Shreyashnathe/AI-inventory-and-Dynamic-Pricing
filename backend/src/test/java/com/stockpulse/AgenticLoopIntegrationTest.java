package com.stockpulse;

import com.stockpulse.dto.ActionSuggestionRequest;
import com.stockpulse.dto.SimulateOrderRequest;
import com.stockpulse.engine.StrategyRegistry;
import com.stockpulse.model.*;
import com.stockpulse.repository.PricingSuggestionRepository;
import com.stockpulse.repository.ProductRepository;
import com.stockpulse.repository.ReorderSuggestionRepository;
import com.stockpulse.service.ProductService;
import com.stockpulse.service.SuggestionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class AgenticLoopIntegrationTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private SuggestionService suggestionService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PricingSuggestionRepository pricingSuggestionRepository;

    @Autowired
    private ReorderSuggestionRepository reorderSuggestionRepository;

    @Autowired
    private StrategyRegistry strategyRegistry;

    @BeforeEach
    void setUp() {
        // Enforce RULE_BASED for deterministic integration testing without external network calls
        strategyRegistry.setMode(StrategyMode.RULE_BASED);
    }

    @Test
    @DisplayName("T-4: Order simulation triggers agentic loop when stock drops below threshold")
    void testAgenticLoopTriggerOnLowStock() throws InterruptedException {
        // PRD-001 initially: stock=45, threshold=20
        Product product = productRepository.findById("PRD-001").orElseThrow();

        // Clear existing suggestions for PRD-001 to test cleanly
        pricingSuggestionRepository.deleteAll(pricingSuggestionRepository.findByProductIdAndStatus("PRD-001", SuggestionStatus.PENDING));
        reorderSuggestionRepository.deleteAll(reorderSuggestionRepository.findByProductIdAndStatus("PRD-001", SuggestionStatus.PENDING));

        // Simulate order of 30 units: remaining stock becomes 15 (< 20 threshold)
        productService.simulateOrder("PRD-001", 30);

        // Wait up to 2 seconds for @Async agentic event listener to complete
        Thread.sleep(1000);

        List<PricingSuggestion> pricingSuggestions = pricingSuggestionRepository
                .findByProductIdAndStatus("PRD-001", SuggestionStatus.PENDING);
        List<ReorderSuggestion> reorderSuggestions = reorderSuggestionRepository
                .findByProductIdAndStatus("PRD-001", SuggestionStatus.PENDING);

        assertFalse(pricingSuggestions.isEmpty(), "Agentic loop should automatically queue a pricing suggestion on low stock");
        assertFalse(reorderSuggestions.isEmpty(), "Agentic loop should automatically queue a reorder suggestion on low stock");

        PricingSuggestion pricing = pricingSuggestions.get(0);
        assertEquals(TriggerReason.INVENTORY_LOW, pricing.getTriggerReason());
        assertTrue(pricing.getRecommendedPrice().compareTo(product.getCurrentPrice()) > 0);

        ReorderSuggestion reorder = reorderSuggestions.get(0);
        assertEquals(TriggerReason.INVENTORY_LOW, reorder.getTriggerReason());
        assertTrue(reorder.getRecommendedQuantity() > 0);
    }

    @Test
    @DisplayName("T-4: Accepting a pricing suggestion updates Product.currentPrice atomically")
    void testAcceptPricingSuggestion() {
        Product product = productRepository.findById("PRD-003").orElseThrow();
        BigDecimal originalPrice = product.getCurrentPrice();

        List<PricingSuggestion> pending = pricingSuggestionRepository.findByProductIdAndStatus("PRD-003", SuggestionStatus.PENDING);
        assertFalse(pending.isEmpty());

        PricingSuggestion suggestion = pending.get(0);
        BigDecimal targetPrice = suggestion.getRecommendedPrice();

        PricingSuggestion actioned = suggestionService.actionPricingSuggestion(suggestion.getId(), SuggestionStatus.ACCEPTED);
        assertEquals(SuggestionStatus.ACCEPTED, actioned.getStatus());

        Product updatedProduct = productRepository.findById("PRD-003").orElseThrow();
        assertEquals(targetPrice, updatedProduct.getCurrentPrice());
        assertNotEquals(originalPrice, updatedProduct.getCurrentPrice());
    }

    @Test
    @DisplayName("T-4: Accepting a reorder suggestion adds stock to Product atomically")
    void testAcceptReorderSuggestion() {
        Product product = productRepository.findById("PRD-003").orElseThrow();
        int initialStock = product.getStockLevel();

        List<ReorderSuggestion> pending = reorderSuggestionRepository.findByProductIdAndStatus("PRD-003", SuggestionStatus.PENDING);
        assertFalse(pending.isEmpty());

        ReorderSuggestion suggestion = pending.get(0);
        int addedQty = suggestion.getRecommendedQuantity();

        ReorderSuggestion actioned = suggestionService.actionReorderSuggestion(suggestion.getId(), SuggestionStatus.ACCEPTED);
        assertEquals(SuggestionStatus.ACCEPTED, actioned.getStatus());

        Product updatedProduct = productRepository.findById("PRD-003").orElseThrow();
        assertEquals(initialStock + addedQty, updatedProduct.getStockLevel());
    }
}
