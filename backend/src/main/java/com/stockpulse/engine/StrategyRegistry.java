package com.stockpulse.engine;

import com.stockpulse.dto.StrategyConfigDto;
import com.stockpulse.model.StrategyMode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class StrategyRegistry {

    private static final Logger log = LoggerFactory.getLogger(StrategyRegistry.class);

    private final PricingStrategy ruleBasedPricing;
    private final PricingStrategy aiPricing;
    private final ReorderStrategy ruleBasedReorder;
    private final ReorderStrategy aiReorder;

    private volatile StrategyMode currentMode;

    public StrategyRegistry(
            @Qualifier("ruleBasedPricingStrategy") PricingStrategy ruleBasedPricing,
            @Qualifier("aiPricingStrategy") PricingStrategy aiPricing,
            @Qualifier("ruleBasedReorderStrategy") ReorderStrategy ruleBasedReorder,
            @Qualifier("aiReorderStrategy") ReorderStrategy aiReorder,
            @Value("${commerce.strategy.default-mode:AI_POWERED}") String defaultMode
    ) {
        this.ruleBasedPricing = ruleBasedPricing;
        this.aiPricing = aiPricing;
        this.ruleBasedReorder = ruleBasedReorder;
        this.aiReorder = aiReorder;

        try {
            this.currentMode = StrategyMode.valueOf(defaultMode.toUpperCase());
        } catch (Exception e) {
            this.currentMode = StrategyMode.AI_POWERED;
        }
        log.info("StrategyRegistry initialized with default mode: [{}]", this.currentMode);
    }

    public PricingStrategy getPricingStrategy() {
        return (currentMode == StrategyMode.AI_POWERED) ? aiPricing : ruleBasedPricing;
    }

    public ReorderStrategy getReorderStrategy() {
        return (currentMode == StrategyMode.AI_POWERED) ? aiReorder : ruleBasedReorder;
    }

    public synchronized void setMode(StrategyMode mode) {
        log.info("Runtime strategy mode switched from [{}] to [{}]", this.currentMode, mode);
        this.currentMode = mode;
    }

    public StrategyMode getMode() {
        return this.currentMode;
    }

    public StrategyConfigDto getConfig() {
        return StrategyConfigDto.builder()
                .mode(this.currentMode)
                .description(this.currentMode == StrategyMode.AI_POWERED
                        ? "Active: LLM Strategic Commerce Advisor (with automatic rule-based fallback)"
                        : "Active: Deterministic Rule-Based Engine (no external calls)")
                .activePricingStrategy(getPricingStrategy().getStrategyName())
                .activeReorderStrategy(getReorderStrategy().getStrategyName())
                .build();
    }
}
