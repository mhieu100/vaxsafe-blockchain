package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.dto.request.VaccineRequest;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.dto.response.VaccineResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Vaccine;
import com.dapp.backend.service.VaccineService;
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
@RequestMapping("/api/vaccines")
@RequiredArgsConstructor
public class VaccineController {

    private final VaccineService vaccineService;

    @GetMapping
    @ApiMessage("Get all vaccines")
    public ResponseEntity<Pagination> getAllVaccines(@Filter Specification<Vaccine> specification,
            Pageable pageable) {
        return ResponseEntity.ok().body(vaccineService.getAllVaccines(specification, pageable));
    }

    @GetMapping("/countries")
    @ApiMessage("Get all countries")
    public ResponseEntity<List<String>> getAllCountries() {
        return ResponseEntity.ok().body(vaccineService.getAllCountries());
    }

    @GetMapping("/{slug}")
    @ApiMessage("Get a vaccine by slug with full info")
    public ResponseEntity<VaccineResponse> getVaccine(@PathVariable String slug) throws AppException {
        return ResponseEntity.ok(vaccineService.getVaccineDetailBySlug(slug));
    }

    @PostMapping
    @ApiMessage("Create a new vaccine")
    public ResponseEntity<VaccineResponse> createVaccine(@Valid @RequestBody VaccineRequest request)
            throws AppException {
        return ResponseEntity.status(HttpStatus.CREATED).body(vaccineService.createVaccine(request));
    }

    @PutMapping("/{id}")
    @ApiMessage("Update a vaccine")
    public ResponseEntity<VaccineResponse> updateVaccine(@PathVariable Long id,
            @Valid @RequestBody VaccineRequest request) throws AppException {
        return ResponseEntity.ok().body(vaccineService.updateVaccine(id, request));
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete a vaccine")
    public ResponseEntity<Void> deleteVaccine(@PathVariable Long id) throws AppException {
        vaccineService.deleteVaccine(id);
        return ResponseEntity.noContent().build();
    }

}
