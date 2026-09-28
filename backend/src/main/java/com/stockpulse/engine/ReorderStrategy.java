package com.stockpulse.engine;

import com.stockpulse.dto.ReorderRecommendationDto;
import com.stockpulse.model.Product;
import com.stockpulse.model.TriggerReason;

public interface ReorderStrategy {

    ReorderRecommendationDto evaluateReorder(Product product, double categoryAvgVelocity, TriggerReason triggerReason);

    String getStrategyName();
}
