package com.stockpulse.controller;

import com.stockpulse.service.DataInitializer;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final DataInitializer dataInitializer;

    public AdminController(DataInitializer dataInitializer) {
        this.dataInitializer = dataInitializer;
    }

    /**
     * POST /api/admin/reset-data
     * Resets the entire database to the benchmark Addendum A seed state.
     */
    @PostMapping("/reset-data")
    public ResponseEntity<Map<String, String>> resetData() {
        dataInitializer.resetDatabase();
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Database successfully reset to canonical Addendum A seed data."
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "service", "StockPulse Engine",
                "status", "UP"
        ));
    }
}
