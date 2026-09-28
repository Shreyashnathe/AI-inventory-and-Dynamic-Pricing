package com.stockpulse.engine;

import com.stockpulse.dto.PricingRecommendationDto;
import com.stockpulse.model.Product;
import com.stockpulse.model.TriggerReason;

public interface PricingStrategy {

    PricingRecommendationDto evaluatePricing(Product product, double categoryAvgVelocity, TriggerReason triggerReason);

    String getStrategyName();
}
