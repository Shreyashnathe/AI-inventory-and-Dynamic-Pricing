package com.stockpulse.repository;

import com.stockpulse.model.ReorderSuggestion;
import com.stockpulse.model.SuggestionStatus;
import com.stockpulse.model.TriggerReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReorderSuggestionRepository extends JpaRepository<ReorderSuggestion, Long> {

    List<ReorderSuggestion> findByStatusOrderByCreatedAtDesc(SuggestionStatus status);

    List<ReorderSuggestion> findByProductIdAndStatus(String productId, SuggestionStatus status);

    boolean existsByProductIdAndStatusAndTriggerReason(String productId, SuggestionStatus status, TriggerReason triggerReason);

    List<ReorderSuggestion> findAllByOrderByCreatedAtDesc();

    long countByProductIdAndStatus(String productId, SuggestionStatus status);
}
