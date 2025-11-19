package com.dapp.backend.service;

import java.text.Normalizer;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.dapp.backend.dto.mapper.CenterMapper;
import com.dapp.backend.dto.request.CenterRequest;
import com.dapp.backend.dto.response.CenterResponse;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Center;
import com.dapp.backend.repository.CenterRepository;
import com.dapp.backend.service.spec.CenterSpecifications;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CenterService {
    private final CenterRepository centerRepository;

    /**
     * Generate URL-friendly slug from center name
     */
    private String generateSlug(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "";
        }

        // Normalize Vietnamese characters to ASCII
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD);
        String slug = normalized.replaceAll("\\p{M}", ""); // Remove diacritical marks

        // Convert to lowercase and replace spaces/special chars with hyphens
        slug = slug.toLowerCase()
                .replaceAll("[đĐ]", "d")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        return slug;
    }

    /**
     * Generate unique slug by appending number if slug already exists
     */
    private String generateUniqueSlug(String baseName, Long excludeId) {
        String baseSlug = generateSlug(baseName);
        String uniqueSlug = baseSlug;
        int counter = 1;

        while (true) {
            final String checkSlug = uniqueSlug;
            var existing = centerRepository.findBySlug(checkSlug);

            if (existing.isEmpty()) {
                break; // Slug is unique
            }

            if (excludeId != null && existing.get().getCenterId().equals(excludeId)) {
                break; // It's the same center being updated
            }

            // Append counter to make it unique
            uniqueSlug = baseSlug + "-" + counter;
            counter++;
        }

        return uniqueSlug;
    }

    public List<String> getAllAddresses() {
        return centerRepository.findDistinctAddresses();
    }

    public Center getCenterBySlug(String slug) throws AppException {
        return centerRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException("Center not found"));
    }

    public CenterResponse getCenterDetailBySlug(String slug) throws AppException {
        Center center = getCenterBySlug(slug);
        return CenterMapper.toResponse(center);
    }

    public Pagination getAllCenters(Specification<Center> specification, Pageable pageable) {
        // Use CenterSpecifications to filter out soft-deleted records
        Specification<Center> finalSpec = specification != null 
            ? specification.and(CenterSpecifications.notDeleted()) 
            : CenterSpecifications.notDeleted();
        
        Page<Center> pageCenter = centerRepository.findAll(finalSpec, pageable);
        Pagination pagination = new Pagination();
        Pagination.Meta meta = new Pagination.Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(pageCenter.getTotalPages());
        meta.setTotal(pageCenter.getTotalElements());
        pagination.setMeta(meta);
        pagination.setResult(pageCenter.getContent().stream().map(CenterMapper::toResponse).toList());
        return pagination;
    }

    public CenterResponse createCenter(CenterRequest request) throws AppException {
        // Auto-generate slug from name if not provided
        if (request.getSlug() == null || request.getSlug().trim().isEmpty()) {
            String slug = generateUniqueSlug(request.getName(), null);
            request.setSlug(slug);
        }

        // Check if center with same name already exists
        if (centerRepository.existsByName(request.getName())) {
            throw new AppException("Center already exists with name: " + request.getName());
        }

        // Convert request to entity and save
        Center center = CenterMapper.toEntity(request);
        Center savedCenter = centerRepository.save(center);

        return CenterMapper.toResponse(savedCenter);
    }

    public CenterResponse updateCenter(Long id, CenterRequest request) throws AppException {
        // Find existing center
        Center existingCenter = centerRepository.findById(id)
                .orElseThrow(() -> new AppException("Center not found with id: " + id));

        // Auto-generate slug from name if not provided (excluding current center from uniqueness check)
        if (request.getSlug() == null || request.getSlug().trim().isEmpty()) {
            String slug = generateUniqueSlug(request.getName(), id);
            request.setSlug(slug);
        }

        // Update the existing center with new data
        CenterMapper.updateEntity(existingCenter, request);
        Center updatedCenter = centerRepository.save(existingCenter);

        return CenterMapper.toResponse(updatedCenter);
    }

    public void deleteCenter(Long id) throws AppException {
        Center center = centerRepository.findById(id)
                .orElseThrow(() -> new AppException("Center not found with id: " + id));

        // Soft delete
        center.setIsDeleted(true);
        centerRepository.save(center);
    }

    public List<Center> getCentersByName(String name) {
        return centerRepository.findAll((root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("name"), name));
    }
}
