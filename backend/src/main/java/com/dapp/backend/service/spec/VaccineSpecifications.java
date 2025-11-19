package com.dapp.backend.service.spec;

import com.dapp.backend.model.Vaccine;
import org.springframework.data.jpa.domain.Specification;

public class VaccineSpecifications {

    /**
     * Specification to filter out soft-deleted vaccines
     * Returns vaccines where isDeleted is NULL or FALSE
     */
    public static Specification<Vaccine> notDeleted() {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.or(
                criteriaBuilder.isNull(root.get("isDeleted")),
                criteriaBuilder.isFalse(root.get("isDeleted"))
            );
    }

    /**
     * Specification to filter vaccines by name (like search)
     */
    public static Specification<Vaccine> nameContains(String name) {
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

    /**
     * Specification to filter vaccines by country
     */
    public static Specification<Vaccine> fromCountry(String country) {
        return (root, query, criteriaBuilder) -> {
            if (country == null || country.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("country"), country);
        };
    }

    /**
     * Specification to filter vaccines by slug
     */
    public static Specification<Vaccine> hasSlug(String slug) {
        return (root, query, criteriaBuilder) -> {
            if (slug == null || slug.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("slug"), slug);
        };
    }

    /**
     * Specification to filter vaccines by manufacturer (like search)
     */
    public static Specification<Vaccine> manufacturerContains(String manufacturer) {
        return (root, query, criteriaBuilder) -> {
            if (manufacturer == null || manufacturer.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("manufacturer")), 
                "%" + manufacturer.toLowerCase() + "%"
            );
        };
    }

    /**
     * Specification to filter vaccines by price range
     */
    public static Specification<Vaccine> priceBetween(Integer minPrice, Integer maxPrice) {
        return (root, query, criteriaBuilder) -> {
            if (minPrice == null && maxPrice == null) {
                return criteriaBuilder.conjunction();
            }
            if (minPrice != null && maxPrice != null) {
                return criteriaBuilder.between(root.get("price"), minPrice, maxPrice);
            }
            if (minPrice != null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice);
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice);
        };
    }

    /**
     * Specification to filter vaccines by stock availability
     */
    public static Specification<Vaccine> hasStockGreaterThan(Integer stock) {
        return (root, query, criteriaBuilder) -> {
            if (stock == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThan(root.get("stock"), stock);
        };
    }

    /**
     * Specification to filter vaccines that are in stock (stock > 0)
     */
    public static Specification<Vaccine> inStock() {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.greaterThan(root.get("stock"), 0);
    }
}
