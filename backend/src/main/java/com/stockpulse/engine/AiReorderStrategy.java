package com.stockpulse.engine;

import com.stockpulse.ai.AiCommerceAdvisor;
import com.stockpulse.dto.ReorderRecommendationDto;
import com.stockpulse.model.Product;
import com.stockpulse.model.TriggerReason;
import org.springframework.stereotype.Component;

@Component("aiReorderStrategy")
public class AiReorderStrategy implements ReorderStrategy {

    private final AiCommerceAdvisor aiCommerceAdvisor;

    public AiReorderStrategy(AiCommerceAdvisor aiCommerceAdvisor) {
        this.aiCommerceAdvisor = aiCommerceAdvisor;
    }

    @Override
    public ReorderRecommendationDto evaluateReorder(Product product, double categoryAvgVelocity, TriggerReason triggerReason) {
        return aiCommerceAdvisor.evaluateReorder(product, categoryAvgVelocity, triggerReason);
    }

    @Override
    public String getStrategyName() {
        return "Qwen-Cursor AI Predictive Replenishment Advisor";
    }
}
