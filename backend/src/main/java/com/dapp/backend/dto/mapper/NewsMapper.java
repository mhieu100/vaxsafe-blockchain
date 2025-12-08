package com.dapp.backend.dto.mapper;

import com.dapp.backend.dto.request.NewsRequest;
import com.dapp.backend.dto.response.NewsResponse;
import com.dapp.backend.model.News;

public class NewsMapper {

    public static NewsResponse toResponse(News news) {
        if (news == null) return null;

        return NewsResponse.builder()
                .id(news.getId())
                .slug(news.getSlug())
                .title(news.getTitle())
                .shortDescription(news.getShortDescription())
                .content(news.getContent())
                .thumbnailImage(news.getThumbnailImage())
                .coverImage(news.getCoverImage())
                .category(news.getCategory())
                .author(news.getAuthor())
                .viewCount(news.getViewCount())
                .isFeatured(news.getIsFeatured())
                .isPublished(news.getIsPublished())
                .publishedAt(news.getPublishedAt())
                .tags(news.getTags())
                .source(news.getSource())
                .createdAt(news.getCreatedAt())
                .updatedAt(news.getUpdatedAt())
                .build();
    }

    public static News toEntity(NewsRequest request) {
        if (request == null) return null;

        return News.builder()
                .slug(request.getSlug())
                .title(request.getTitle())
                .shortDescription(request.getShortDescription())
                .content(request.getContent())
                .thumbnailImage(request.getThumbnailImage())
                .coverImage(request.getCoverImage())
                .category(request.getCategory())
                .author(request.getAuthor())
                .viewCount(0L)
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .isPublished(request.getIsPublished() != null ? request.getIsPublished() : false)
                .publishedAt(request.getPublishedAt())
                .tags(request.getTags())
                .source(request.getSource())
                .build();
    }

    public static void updateEntity(News news, NewsRequest request) {
        if (news == null || request == null) return;


        if (request.getSlug() != null && !request.getSlug().trim().isEmpty()) {
            news.setSlug(request.getSlug());
        }

        news.setTitle(request.getTitle());
        news.setShortDescription(request.getShortDescription());
        news.setContent(request.getContent());
        news.setThumbnailImage(request.getThumbnailImage());
        news.setCoverImage(request.getCoverImage());
        news.setCategory(request.getCategory());
        news.setAuthor(request.getAuthor());

        if (request.getIsFeatured() != null) {
            news.setIsFeatured(request.getIsFeatured());
        }

        if (request.getIsPublished() != null) {
            news.setIsPublished(request.getIsPublished());
        }

        news.setPublishedAt(request.getPublishedAt());
        news.setTags(request.getTags());
        news.setSource(request.getSource());
    }
}
