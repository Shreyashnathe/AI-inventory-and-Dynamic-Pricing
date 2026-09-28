package com.stockpulse.controller;

import com.stockpulse.dto.StrategyConfigDto;
import com.stockpulse.engine.StrategyRegistry;
import com.stockpulse.model.StrategyMode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/strategy")
public class StrategyController {

    private final StrategyRegistry strategyRegistry;

    public StrategyController(StrategyRegistry strategyRegistry) {
        this.strategyRegistry = strategyRegistry;
    }

    /**
     * GET /api/strategy
     * Get active commerce engine strategy configuration.
     */
    @GetMapping
    public ResponseEntity<StrategyConfigDto> getActiveStrategy() {
        return ResponseEntity.ok(strategyRegistry.getConfig());
    }

    /**
     * POST /api/strategy
     * Switch active commerce strategy at runtime without server restart.
     */
    @PostMapping
    public ResponseEntity<StrategyConfigDto> switchStrategy(@RequestBody StrategyConfigDto request) {
        if (request.getMode() != null) {
            strategyRegistry.setMode(request.getMode());
        }
        return ResponseEntity.ok(strategyRegistry.getConfig());
    }
}
