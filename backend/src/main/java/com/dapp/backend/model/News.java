package com.dapp.backend.model;

import com.dapp.backend.enums.NewsCategory;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "news")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class News extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false, unique = true)
    String slug;

    @Column(nullable = false, length = 500)
    String title;

    @Column(name = "short_description", length = 1000)
    String shortDescription;

    @Column(columnDefinition = "text")
    String content;

    @Column(name = "thumbnail_image", length = 500)
    String thumbnailImage;

    @Column(name = "cover_image", length = 500)
    String coverImage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    NewsCategory category;

    @Column(length = 200)
    String author;

    @Column(name = "view_count")
    @Builder.Default
    Long viewCount = 0L;

    @Column(name = "is_featured")
    @Builder.Default
    Boolean isFeatured = false;

    @Column(name = "is_published")
    @Builder.Default
    Boolean isPublished = false;

    @Column(name = "published_at")
    java.time.LocalDateTime publishedAt;

    @Column(length = 500)
    String tags; // Comma-separated tags

    @Column(length = 500)
    String source; // Nguồn tin tức
}
