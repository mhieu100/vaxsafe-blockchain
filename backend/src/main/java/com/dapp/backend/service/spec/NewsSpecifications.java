package com.dapp.backend.service.spec;

import com.dapp.backend.enums.NewsCategory;
import com.dapp.backend.model.News;
import org.springframework.data.jpa.domain.Specification;

public class NewsSpecifications {

    
    public static Specification<News> notDeleted() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.or(
                        criteriaBuilder.isNull(root.get("isDeleted")),
                        criteriaBuilder.isFalse(root.get("isDeleted"))
                );
    }

    
    public static Specification<News> titleContains(String title) {
        return (root, query, criteriaBuilder) -> {
            if (title == null || title.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")),
                    "%" + title.toLowerCase() + "%"
            );
        };
    }

    
    public static Specification<News> hasCategory(NewsCategory category) {
        return (root, query, criteriaBuilder) -> {
            if (category == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("category"), category);
        };
    }

    
    public static Specification<News> isPublished() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.isTrue(root.get("isPublished"));
    }

    
    public static Specification<News> isFeatured() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.isTrue(root.get("isFeatured"));
    }

    
    public static Specification<News> authorContains(String author) {
        return (root, query, criteriaBuilder) -> {
            if (author == null || author.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("author")),
                    "%" + author.toLowerCase() + "%"
            );
        };
    }

    
    public static Specification<News> tagsContain(String tag) {
        return (root, query, criteriaBuilder) -> {
            if (tag == null || tag.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("tags")),
                    "%" + tag.toLowerCase() + "%"
            );
        };
    }

    
    public static Specification<News> contentContains(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String likePattern = "%" + keyword.toLowerCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("shortDescription")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("content")), likePattern)
            );
        };
    }
}
