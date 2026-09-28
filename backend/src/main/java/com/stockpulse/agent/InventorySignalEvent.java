package com.stockpulse.agent;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class InventorySignalEvent {

    private final String productId;
    private final int oldStock;
    private final int newStock;
    private final int oldVelocity;
    private final int newVelocity;
    private final String source; // "STOCK_UPDATE" or "ORDER_SALE"
}
