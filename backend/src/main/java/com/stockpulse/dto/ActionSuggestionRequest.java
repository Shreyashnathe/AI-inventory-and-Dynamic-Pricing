package com.stockpulse.dto;

import com.stockpulse.model.SuggestionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActionSuggestionRequest {

    @NotNull(message = "Action status is required (ACCEPTED or REJECTED)")
    private SuggestionStatus status;
}
