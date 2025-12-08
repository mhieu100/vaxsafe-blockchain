package com.dapp.backend.service.spec;

import com.dapp.backend.model.Center;
import org.springframework.data.jpa.domain.Specification;

public class CenterSpecifications {

    
    public static Specification<Center> notDeleted() {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.or(
                criteriaBuilder.isNull(root.get("isDeleted")),
                criteriaBuilder.isFalse(root.get("isDeleted"))
            );
    }

    
    public static Specification<Center> nameContains(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("name")), 
                "%" + name.toLowerCase() + "%"
            );
        };
    }

    
    public static Specification<Center> addressContains(String address) {
        return (root, query, criteriaBuilder) -> {
            if (address == null || address.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("address")), 
                "%" + address.toLowerCase() + "%"
            );
        };
    }

    
    public static Specification<Center> hasSlug(String slug) {
        return (root, query, criteriaBuilder) -> {
            if (slug == null || slug.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("slug"), slug);
        };
    }

    
    public static Specification<Center> capacityGreaterThanOrEqual(Integer capacity) {
        return (root, query, criteriaBuilder) -> {
            if (capacity == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("capacity"), capacity);
        };
    }
}
