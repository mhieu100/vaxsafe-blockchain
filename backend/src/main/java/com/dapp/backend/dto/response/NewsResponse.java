package com.dapp.backend.dto.response;

import com.dapp.backend.enums.NewsCategory;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NewsResponse {

    Long id;
    String slug;
    String title;
    String shortDescription;
    String content;
    String thumbnailImage;
    String coverImage;
    NewsCategory category;
    String author;
    Long viewCount;
    Boolean isFeatured;
    Boolean isPublished;
    LocalDateTime publishedAt;
    String tags;
    String source;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
