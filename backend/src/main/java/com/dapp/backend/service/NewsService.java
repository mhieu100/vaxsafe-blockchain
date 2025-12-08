package com.dapp.backend.service;

import com.dapp.backend.dto.mapper.NewsMapper;
import com.dapp.backend.dto.request.NewsRequest;
import com.dapp.backend.dto.response.NewsResponse;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.enums.NewsCategory;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.News;
import com.dapp.backend.repository.NewsRepository;
import com.dapp.backend.service.spec.NewsSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NewsService {

    private final NewsRepository newsRepository;

    public NewsService(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    
    private String generateSlug(String name) {
        if (name == null || name.trim().isEmpty()) return "";

        String slug = name.toLowerCase().trim();


        slug = slug.replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a");
        slug = slug.replaceAll("[èéẹẻẽêềếệểễ]", "e");
        slug = slug.replaceAll("[ìíịỉĩ]", "i");
        slug = slug.replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o");
        slug = slug.replaceAll("[ùúụủũưừứựửữ]", "u");
        slug = slug.replaceAll("[ỳýỵỷỹ]", "y");
        slug = slug.replaceAll("đ", "d");


        slug = slug.replaceAll("[^a-z0-9\\s-]", "");
        slug = slug.replaceAll("\\s+", "-");
        slug = slug.replaceAll("-+", "-");
        slug = slug.replaceAll("^-|-$", "");

        return slug;
    }

    
    private String generateUniqueSlug(String baseName, Long excludeId) {
        String baseSlug = generateSlug(baseName);
        String uniqueSlug = baseSlug;
        int counter = 1;

        while (true) {
            var existing = newsRepository.findBySlug(uniqueSlug);
            if (existing.isEmpty()) break;
            if (excludeId != null && existing.get().getId().equals(excludeId)) break;
            uniqueSlug = baseSlug + "-" + counter++;
        }

        return uniqueSlug;
    }

    
    public Pagination getAllNews(Specification<News> specification, Pageable pageable) {
        Specification<News> finalSpec = specification != null
                ? specification.and(NewsSpecifications.notDeleted())
                : NewsSpecifications.notDeleted();

        Page<News> pageNews = newsRepository.findAll(finalSpec, pageable);

        Pagination pagination = new Pagination();
        Pagination.Meta meta = new Pagination.Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(pageNews.getTotalPages());
        meta.setTotal(pageNews.getTotalElements());

        pagination.setMeta(meta);
        pagination.setResult(pageNews.getContent().stream()
                .map(NewsMapper::toResponse)
                .collect(Collectors.toList()));

        return pagination;
    }

    
    public List<NewsResponse> getPublishedNews() {
        return newsRepository.findPublishedNews().stream()
                .map(NewsMapper::toResponse)
                .collect(Collectors.toList());
    }

    
    public List<NewsResponse> getFeaturedNews() {
        return newsRepository.findFeaturedNews().stream()
                .map(NewsMapper::toResponse)
                .collect(Collectors.toList());
    }

    
    @Transactional
    public NewsResponse getNewsBySlug(String slug) throws AppException {
        News news = newsRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException("News not found with slug: " + slug));

        if (Boolean.TRUE.equals(news.getIsDeleted())) {
            throw new AppException("News not found with slug: " + slug);
        }


        newsRepository.incrementViewCount(news.getId());
        news.setViewCount(news.getViewCount() + 1);

        return NewsMapper.toResponse(news);
    }

    
    public NewsResponse getNewsById(Long id) throws AppException {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new AppException("News not found with id: " + id));

        if (Boolean.TRUE.equals(news.getIsDeleted())) {
            throw new AppException("News not found with id: " + id);
        }

        return NewsMapper.toResponse(news);
    }

    
    public List<NewsResponse> getNewsByCategory(NewsCategory category) {
        Specification<News> spec = NewsSpecifications.notDeleted()
                .and(NewsSpecifications.hasCategory(category))
                .and(NewsSpecifications.isPublished());

        return newsRepository.findAll(spec).stream()
                .map(NewsMapper::toResponse)
                .collect(Collectors.toList());
    }

    
    public List<NewsCategory> getAllCategories() {
        return newsRepository.findDistinctCategories();
    }

    
    @Transactional
    public NewsResponse createNews(NewsRequest request) throws AppException {

        if (request.getSlug() == null || request.getSlug().trim().isEmpty()) {
            String slug = generateUniqueSlug(request.getTitle(), null);
            request.setSlug(slug);
        } else {

            if (newsRepository.findBySlug(request.getSlug()).isPresent()) {
                throw new AppException("News with slug already exists: " + request.getSlug());
            }
        }


        if (Boolean.TRUE.equals(request.getIsPublished()) && request.getPublishedAt() == null) {
            request.setPublishedAt(LocalDateTime.now());
        }

        News news = NewsMapper.toEntity(request);
        News savedNews = newsRepository.save(news);

        return NewsMapper.toResponse(savedNews);
    }

    
    @Transactional
    public NewsResponse updateNews(Long id, NewsRequest request) throws AppException {
        News existingNews = newsRepository.findById(id)
                .orElseThrow(() -> new AppException("News not found with id: " + id));

        if (Boolean.TRUE.equals(existingNews.getIsDeleted())) {
            throw new AppException("News not found with id: " + id);
        }


        if (request.getSlug() == null || request.getSlug().trim().isEmpty()) {
            String slug = generateUniqueSlug(request.getTitle(), id);
            request.setSlug(slug);
        } else if (!request.getSlug().equals(existingNews.getSlug())) {

            var existingWithSlug = newsRepository.findBySlug(request.getSlug());
            if (existingWithSlug.isPresent() && !existingWithSlug.get().getId().equals(id)) {
                throw new AppException("News with slug already exists: " + request.getSlug());
            }
        }


        if (Boolean.TRUE.equals(request.getIsPublished())
                && Boolean.FALSE.equals(existingNews.getIsPublished())
                && request.getPublishedAt() == null) {
            request.setPublishedAt(LocalDateTime.now());
        }

        NewsMapper.updateEntity(existingNews, request);
        News updatedNews = newsRepository.save(existingNews);

        return NewsMapper.toResponse(updatedNews);
    }

    
    @Transactional
    public void deleteNews(Long id) throws AppException {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new AppException("News not found with id: " + id));

        news.setIsDeleted(true);
        newsRepository.save(news);
    }

    
    @Transactional
    public NewsResponse publishNews(Long id) throws AppException {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new AppException("News not found with id: " + id));

        if (Boolean.TRUE.equals(news.getIsDeleted())) {
            throw new AppException("News not found with id: " + id);
        }

        news.setIsPublished(true);
        if (news.getPublishedAt() == null) {
            news.setPublishedAt(LocalDateTime.now());
        }

        News updatedNews = newsRepository.save(news);
        return NewsMapper.toResponse(updatedNews);
    }

    
    @Transactional
    public NewsResponse unpublishNews(Long id) throws AppException {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new AppException("News not found with id: " + id));

        if (Boolean.TRUE.equals(news.getIsDeleted())) {
            throw new AppException("News not found with id: " + id);
        }

        news.setIsPublished(false);
        News updatedNews = newsRepository.save(news);

        return NewsMapper.toResponse(updatedNews);
    }
}
