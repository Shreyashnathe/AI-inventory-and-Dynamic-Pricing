package com.stockpulse.dto;

import com.stockpulse.model.PriceDirection;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingRecommendationDto {

    private BigDecimal recommendedPrice;
    private PriceDirection direction;
    private Double confidence;
    private String reasoning;
}
