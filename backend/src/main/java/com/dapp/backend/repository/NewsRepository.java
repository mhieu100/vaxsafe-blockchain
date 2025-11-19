package com.dapp.backend.repository;

import com.dapp.backend.enums.NewsCategory;
import com.dapp.backend.model.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NewsRepository extends JpaRepository<News, Long>, JpaSpecificationExecutor<News> {

    Optional<News> findBySlug(String slug);

    List<News> findByCategory(NewsCategory category);

    List<News> findByIsFeaturedTrue();

    List<News> findByIsPublishedTrue();

    @Query("SELECT DISTINCT n.category FROM News n WHERE n.isDeleted = false OR n.isDeleted IS NULL")
    List<NewsCategory> findDistinctCategories();

    @Query("SELECT n FROM News n WHERE n.isPublished = true AND (n.isDeleted = false OR n.isDeleted IS NULL) ORDER BY n.publishedAt DESC")
    List<News> findPublishedNews();

    @Query("SELECT n FROM News n WHERE n.isFeatured = true AND n.isPublished = true AND (n.isDeleted = false OR n.isDeleted IS NULL) ORDER BY n.publishedAt DESC")
    List<News> findFeaturedNews();

    @Modifying
    @Query("UPDATE News n SET n.viewCount = n.viewCount + 1 WHERE n.id = :id")
    void incrementViewCount(@Param("id") Long id);
}
