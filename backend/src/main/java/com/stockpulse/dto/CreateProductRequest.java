package com.stockpulse.dto;

import com.stockpulse.model.ProductCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProductRequest {

    private String id;

    @NotBlank(message = "SKU cannot be blank")
    private String sku;

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotNull(message = "Category is required")
    private ProductCategory category;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be positive")
    private BigDecimal currentPrice;

    @NotNull(message = "Stock level is required")
    @Min(value = 0, message = "Stock level cannot be negative")
    private Integer stockLevel;

    @NotNull(message = "Reorder threshold is required")
    @Min(value = 1, message = "Reorder threshold must be at least 1")
    private Integer reorderThreshold;

    @Min(value = 0, message = "Demand velocity cannot be negative")
    private Integer demandVelocity;

    // Sprint 2 extension seam fields
    private BigDecimal costPrice;
    private BigDecimal marginFloor;
    private String supplierId;
}
