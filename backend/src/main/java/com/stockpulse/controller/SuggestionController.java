package com.stockpulse.controller;

import com.stockpulse.dto.ActionSuggestionRequest;
import com.stockpulse.model.PricingSuggestion;
import com.stockpulse.model.ReorderSuggestion;
import com.stockpulse.model.SuggestionStatus;
import com.stockpulse.service.SuggestionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api", ""})
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class SuggestionController {

    private final SuggestionService suggestionService;

    public SuggestionController(SuggestionService suggestionService) {
        this.suggestionService = suggestionService;
    }

    /**
     * GET /api/pricing-suggestions?status=
     * List pricing suggestions (filtered by PENDING, ACCEPTED, REJECTED).
     */
    @GetMapping("/pricing-suggestions")
    public ResponseEntity<List<PricingSuggestion>> getPricingSuggestions(
            @RequestParam(required = false) SuggestionStatus status
    ) {
        return ResponseEntity.ok(suggestionService.getPricingSuggestions(status));
    }

    /**
     * PATCH /api/pricing-suggestions/{id}
     * Accept or reject pricing suggestion.
     * Accept updates Product.currentPrice atomically.
     */
    @PatchMapping("/pricing-suggestions/{id}")
    public ResponseEntity<PricingSuggestion> actionPricingSuggestion(
            @PathVariable Long id,
            @Valid @RequestBody ActionSuggestionRequest request
    ) {
        PricingSuggestion updated = suggestionService.actionPricingSuggestion(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }

    /**
     * GET /api/reorder-suggestions?status=
     * List reorder replenishment suggestions.
     */
    @GetMapping("/reorder-suggestions")
    public ResponseEntity<List<ReorderSuggestion>> getReorderSuggestions(
            @RequestParam(required = false) SuggestionStatus status
    ) {
        return ResponseEntity.ok(suggestionService.getReorderSuggestions(status));
    }

    /**
     * PATCH /api/reorder-suggestions/{id}
     * Accept or reject reorder suggestion.
     * Accept increments stock level (simulated inbound shipment).
     */
    @PatchMapping("/reorder-suggestions/{id}")
    public ResponseEntity<ReorderSuggestion> actionReorderSuggestion(
            @PathVariable Long id,
            @Valid @RequestBody ActionSuggestionRequest request
    ) {
        ReorderSuggestion updated = suggestionService.actionReorderSuggestion(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }
}
