package com.stockpulse.engine;

import com.stockpulse.ai.AiCommerceAdvisor;
import com.stockpulse.dto.PricingRecommendationDto;
import com.stockpulse.model.Product;
import com.stockpulse.model.TriggerReason;
import org.springframework.stereotype.Component;

@Component("aiPricingStrategy")
public class AiPricingStrategy implements PricingStrategy {

    private final AiCommerceAdvisor aiCommerceAdvisor;

    public AiPricingStrategy(AiCommerceAdvisor aiCommerceAdvisor) {
        this.aiCommerceAdvisor = aiCommerceAdvisor;
    }

    @Override
    public PricingRecommendationDto evaluatePricing(Product product, double categoryAvgVelocity, TriggerReason triggerReason) {
        return aiCommerceAdvisor.evaluatePricing(product, categoryAvgVelocity, triggerReason);
    }

    @Override
    public String getStrategyName() {
        return "Qwen-Cursor AI Strategic Commerce Advisor";
    }
}
