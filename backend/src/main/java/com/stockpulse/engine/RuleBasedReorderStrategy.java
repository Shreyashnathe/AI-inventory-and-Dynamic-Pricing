package com.stockpulse.engine;

import com.stockpulse.dto.ReorderRecommendationDto;
import com.stockpulse.model.Product;
import com.stockpulse.model.TriggerReason;
import org.springframework.stereotype.Component;

@Component("ruleBasedReorderStrategy")
public class RuleBasedReorderStrategy implements ReorderStrategy {

    @Override
    public ReorderRecommendationDto evaluateReorder(Product product, double categoryAvgVelocity, TriggerReason triggerReason) {
        int threshold = product.getReorderThreshold();
        int stock = product.getStockLevel();

        // Formula: recommended quantity = (reorder threshold * 3) - current stock, minimum 1
        int targetBuffer = threshold * 3;
        int recommendedQty = Math.max(1, targetBuffer - stock);
        int leadTimeDays = 5;

        return ReorderRecommendationDto.builder()
                .recommendedQuantity(recommendedQty)
                .suggestedLeadTimeDays(leadTimeDays)
                .confidence(0.85)
                .reasoning(String.format(
                        "Rule-Based Reorder: Baseline target buffer is 3x threshold (%d units). " +
                        "Current stock is %d units. Recommending %d units replenishment with estimated %d-day supplier lead time.",
                        targetBuffer, stock, recommendedQty, leadTimeDays))
                .build();
    }

    @Override
    public String getStrategyName() {
        return "Deterministic Inventory Buffer Engine (v1.0)";
    }
}
