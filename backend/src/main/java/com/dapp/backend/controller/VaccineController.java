package com.dapp.backend.controller;

import lombok.RequiredArgsConstructor;
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
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Vaccine;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.service.VaccineService;
import com.turkraft.springfilter.boot.Filter;

import jakarta.validation.Valid;

import java.util.List;


@RestController
@RequestMapping("/vaccines")
@RequiredArgsConstructor
public class VaccineController {

    private final VaccineService vaccineService;

    @GetMapping("/{slug}")
    @ApiMessage("Get a vaccine by sku")
    public ResponseEntity<Vaccine> getVaccineBySlug(@PathVariable String slug) throws AppException {
        return ResponseEntity.ok().body(vaccineService.getVaccineBySku(slug));
    }

    @GetMapping
    @ApiMessage("Get vaccines")
    public ResponseEntity<Pagination> getAllVaccines(@Filter Specification<Vaccine> specification,
            Pageable pageable) {
        return ResponseEntity.ok().body(vaccineService.getAllVaccines(specification, pageable));
    }

    @GetMapping("/countries")
    @ApiMessage("Get all country")
    public ResponseEntity<List<String>> getAllVaccines() {
        return ResponseEntity.ok().body(vaccineService.getAllCountries());
    }

//    @PostMapping
//    @ApiMessage("Create a new vaccine")
//    public ResponseEntity<Vaccine> createVaccine(@Valid @RequestBody Vaccine vaccine) throws AppException {
//        return ResponseEntity.status(HttpStatus.CREATED).body(vaccineService.createVaccine(vaccine));
//    }
//
//    @PutMapping("/{id}")
//    @ApiMessage("Update a vaccine")
//    public ResponseEntity<Vaccine> updateVaccine(@PathVariable Long id, @Valid @RequestBody Vaccine vaccine) throws AppException {
//        return ResponseEntity.ok().body(vaccineService.updateVaccine(id, vaccine));
//    }
//
//    @DeleteMapping("/{id}")
//    @ApiMessage("Delete a vaccine")
//    public void deleteVaccine(@PathVariable Long id) throws AppException {
//        vaccineService.deleteVaccine(id);
//    }
//
}
