package com.stockpulse.repository;

import com.stockpulse.model.Product;
import com.stockpulse.model.ProductCategory;
import com.stockpulse.model.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {

    List<Product> findByCategory(ProductCategory category);

    List<Product> findByStatus(ProductStatus status);

    List<Product> findByCategoryAndStatus(ProductCategory category, ProductStatus status);

    List<Product> findAllByOrderByCategoryAscNameAsc();

    default Double findAverageVelocityByCategory(ProductCategory category) {
        List<Product> list = findByCategory(category);
        if (list == null || list.isEmpty()) return 0.0;
        return list.stream()
                .mapToInt(p -> p.getDemandVelocity() != null ? p.getDemandVelocity() : 0)
                .average()
                .orElse(0.0);
    }
}
