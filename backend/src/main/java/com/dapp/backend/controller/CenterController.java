package com.dapp.backend.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.dto.request.CenterRequest;
import com.dapp.backend.dto.response.CenterResponse;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Center;
import com.dapp.backend.service.CenterService;
import com.turkraft.springfilter.boot.Filter;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/centers")
@RequiredArgsConstructor
public class CenterController {

    private final CenterService centerService;

    @GetMapping("/{slug}")
    @ApiMessage("Get center by slug")
    public ResponseEntity<CenterResponse> getCenterBySlug(@PathVariable String slug) throws AppException {
        return ResponseEntity.ok().body(centerService.getCenterDetailBySlug(slug));
    }

    @GetMapping
    @ApiMessage("Get all centers")
    public ResponseEntity<Pagination> getAllCenters(
            @Filter Specification<Center> specification,
            Pageable pageable) {
        return ResponseEntity.ok().body(centerService.getAllCenters(specification, pageable));
    }

    @PostMapping
    @ApiMessage("Create a new center")
    public ResponseEntity<CenterResponse> createCenter(@Valid @RequestBody CenterRequest request)
            throws AppException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(centerService.createCenter(request));
    }

    @PutMapping("/{id}")
    @ApiMessage("Update a center")
    public ResponseEntity<CenterResponse> updateCenter(
            @PathVariable Long id,
            @Valid @RequestBody CenterRequest request) throws AppException {
        return ResponseEntity.ok().body(centerService.updateCenter(id, request));
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete a center")
    public ResponseEntity<Void> deleteCenter(@PathVariable Long id) throws AppException {
        centerService.deleteCenter(id);
        return ResponseEntity.noContent().build();
    }
}
