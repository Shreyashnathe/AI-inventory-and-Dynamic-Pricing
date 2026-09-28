package com.stockpulse.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SimulateOrderRequest {

    @Min(value = 1, message = "Order quantity must be at least 1")
    private Integer quantity = 1;
}
