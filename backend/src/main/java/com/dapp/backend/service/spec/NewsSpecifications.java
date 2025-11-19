package com.dapp.backend.service.spec;

import com.dapp.backend.enums.NewsCategory;
import com.dapp.backend.model.News;
import org.springframework.data.jpa.domain.Specification;

public class NewsSpecifications {

    /**
     * Filter out soft-deleted records
     */
    public static Specification<News> notDeleted() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.or(
                        criteriaBuilder.isNull(root.get("isDeleted")),
                        criteriaBuilder.isFalse(root.get("isDeleted"))
                );
    }

    /**
     * Filter by title (like search)
     */
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

    /**
     * Filter by category
     */
    public static Specification<News> hasCategory(NewsCategory category) {
        return (root, query, criteriaBuilder) -> {
            if (category == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("category"), category);
        };
    }

    /**
     * Filter by published status
     */
    public static Specification<News> isPublished() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.isTrue(root.get("isPublished"));
    }

    /**
     * Filter by featured status
     */
    public static Specification<News> isFeatured() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.isTrue(root.get("isFeatured"));
    }

    /**
     * Filter by author name
     */
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

    /**
     * Filter by tags (contains search)
     */
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

    /**
     * Filter by content search
     */
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
