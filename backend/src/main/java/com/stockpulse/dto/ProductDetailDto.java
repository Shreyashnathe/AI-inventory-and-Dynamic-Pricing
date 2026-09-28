package com.stockpulse.dto;

import com.stockpulse.model.PricingSuggestion;
import com.stockpulse.model.Product;
import com.stockpulse.model.ReorderSuggestion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetailDto {

    private Product product;
    private Double categoryAvgVelocity;
    private PricingSuggestion pendingPricingSuggestion;
    private ReorderSuggestion pendingReorderSuggestion;
    private String stockHealth;
}
