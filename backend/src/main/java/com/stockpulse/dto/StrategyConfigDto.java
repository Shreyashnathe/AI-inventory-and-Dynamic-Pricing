package com.stockpulse.dto;

import com.stockpulse.model.StrategyMode;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StrategyConfigDto {

    @NotNull(message = "Strategy mode is required (RULE_BASED or AI_POWERED)")
    private StrategyMode mode;

    private String description;
    private String activePricingStrategy;
    private String activeReorderStrategy;
}
