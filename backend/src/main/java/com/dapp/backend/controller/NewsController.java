package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.dto.request.NewsRequest;
import com.dapp.backend.dto.response.NewsResponse;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.enums.NewsCategory;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.News;
import com.dapp.backend.service.NewsService;
import com.turkraft.springfilter.boot.Filter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    /**
     * Get all news with pagination and filtering
     * Example filters:
     * - ?filter=category:'VACCINE_INFO'
     * - ?filter=isPublished:true
     * - ?filter=title~'*vaccine*'
     * - ?filter=category:'HEALTH_GENERAL' and isPublished:true
     */
    @GetMapping
    @ApiMessage("Get all news with pagination and filtering")
    public ResponseEntity<Pagination> getAllNews(
            @Filter Specification<News> specification,
            Pageable pageable) {
        return ResponseEntity.ok(newsService.getAllNews(specification, pageable));
    }

    /**
     * Get published news only
     */
    @GetMapping("/published")
    @ApiMessage("Get all published news")
    public ResponseEntity<List<NewsResponse>> getPublishedNews() {
        return ResponseEntity.ok(newsService.getPublishedNews());
    }

    /**
     * Get featured news
     */
    @GetMapping("/featured")
    @ApiMessage("Get featured news")
    public ResponseEntity<List<NewsResponse>> getFeaturedNews() {
        return ResponseEntity.ok(newsService.getFeaturedNews());
    }

    /**
     * Get news by slug (for public view)
     */
    @GetMapping("/slug/{slug}")
    @ApiMessage("Get news by slug")
    public ResponseEntity<NewsResponse> getNewsBySlug(@PathVariable String slug) throws AppException {
        return ResponseEntity.ok(newsService.getNewsBySlug(slug));
    }

    /**
     * Get news by ID
     */
    @GetMapping("/{id}")
    @ApiMessage("Get news by ID")
    public ResponseEntity<NewsResponse> getNewsById(@PathVariable Long id) throws AppException {
        return ResponseEntity.ok(newsService.getNewsById(id));
    }

    /**
     * Get news by category
     */
    @GetMapping("/category/{category}")
    @ApiMessage("Get news by category")
    public ResponseEntity<List<NewsResponse>> getNewsByCategory(@PathVariable NewsCategory category) {
        return ResponseEntity.ok(newsService.getNewsByCategory(category));
    }

    /**
     * Get all available categories
     */
    @GetMapping("/categories")
    @ApiMessage("Get all news categories")
    public ResponseEntity<List<NewsCategory>> getAllCategories() {
        return ResponseEntity.ok(newsService.getAllCategories());
    }

    /**
     * Create new news article
     */
    @PostMapping
    @ApiMessage("Create new news article")
    public ResponseEntity<NewsResponse> createNews(@Valid @RequestBody NewsRequest request) throws AppException {
        return ResponseEntity.status(HttpStatus.CREATED).body(newsService.createNews(request));
    }

    /**
     * Update news article
     */
    @PutMapping("/{id}")
    @ApiMessage("Update news article")
    public ResponseEntity<NewsResponse> updateNews(
            @PathVariable Long id,
            @Valid @RequestBody NewsRequest request) throws AppException {
        return ResponseEntity.ok(newsService.updateNews(id, request));
    }

    /**
     * Delete news article (soft delete)
     */
    @DeleteMapping("/{id}")
    @ApiMessage("Delete news article")
    public ResponseEntity<Void> deleteNews(@PathVariable Long id) throws AppException {
        newsService.deleteNews(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Publish news article
     */
    @PatchMapping("/{id}/publish")
    @ApiMessage("Publish news article")
    public ResponseEntity<NewsResponse> publishNews(@PathVariable Long id) throws AppException {
        return ResponseEntity.ok(newsService.publishNews(id));
    }

    /**
     * Unpublish news article
     */
    @PatchMapping("/{id}/unpublish")
    @ApiMessage("Unpublish news article")
    public ResponseEntity<NewsResponse> unpublishNews(@PathVariable Long id) throws AppException {
        return ResponseEntity.ok(newsService.unpublishNews(id));
    }
}
