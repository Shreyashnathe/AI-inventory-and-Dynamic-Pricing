package com.stockpulse.repository;

import com.stockpulse.model.InventorySnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventorySnapshotRepository extends JpaRepository<InventorySnapshot, Long> {

    List<InventorySnapshot> findByProductIdOrderByRecordedAtDesc(String productId);

    List<InventorySnapshot> findTop20ByProductIdOrderByRecordedAtDesc(String productId);
}
