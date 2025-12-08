package com.dapp.backend.dto.request;

import com.dapp.backend.enums.NewsCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NewsRequest {

    String slug;

    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title must not exceed 500 characters")
    String title;

    @Size(max = 1000, message = "Short description must not exceed 1000 characters")
    String shortDescription;

    @NotBlank(message = "Content is required")
    String content;

    String thumbnailImage;

    String coverImage;

    @NotNull(message = "Category is required")
    NewsCategory category;

    @Size(max = 200, message = "Author name must not exceed 200 characters")
    String author;

    Boolean isFeatured;

    Boolean isPublished;

    LocalDateTime publishedAt;

    @Size(max = 500, message = "Tags must not exceed 500 characters")
    String tags;

    @Size(max = 500, message = "Source must not exceed 500 characters")
    String source;
}
