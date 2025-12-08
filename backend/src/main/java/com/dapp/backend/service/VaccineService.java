package com.dapp.backend.service;

import com.dapp.backend.dto.mapper.VaccineMapper;
import com.dapp.backend.dto.request.VaccineRequest;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.dto.response.VaccineResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Vaccine;
import com.dapp.backend.repository.VaccineRepository;
import com.dapp.backend.service.spec.VaccineSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class VaccineService {
    private final VaccineRepository vaccineRepository;

    public VaccineService(VaccineRepository vaccineRepository) {
        this.vaccineRepository = vaccineRepository;
    }

    
    private String generateSlug(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "";
        }


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
        
        return slug;
    }

    
    private String generateUniqueSlug(String baseName, Long excludeId) {
        String baseSlug = generateSlug(baseName);
        String uniqueSlug = baseSlug;
        int counter = 1;

        while (true) {
            final String checkSlug = uniqueSlug;
            var existing = vaccineRepository.findBySlug(checkSlug);
            
            if (existing.isEmpty()) {
                break;
            }
            
            if (excludeId != null && existing.get().getId() == excludeId) {
                break;
            }
            

            uniqueSlug = baseSlug + "-" + counter;
            counter++;
        }

        return uniqueSlug;
    }

    public List<String> getAllCountries() {
        return vaccineRepository.findDistinctCountries();
    }

    public Vaccine getVaccineBySku(String slug) throws AppException {
        return vaccineRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException("Vaccine not found"));
    }

    public VaccineResponse getVaccineDetailBySlug(String slug) throws AppException {
        Vaccine v = getVaccineBySku(slug);
        return VaccineMapper.toResponse(v);
    }

    public Pagination getAllVaccines(Specification<Vaccine> specification, Pageable pageable) {

        Specification<Vaccine> finalSpec = specification != null 
            ? specification.and(VaccineSpecifications.notDeleted()) 
            : VaccineSpecifications.notDeleted();
        
        Page<Vaccine> pageVaccine = vaccineRepository.findAll(finalSpec, pageable);
        Pagination pagination = new Pagination();
        Pagination.Meta meta = new Pagination.Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(pageVaccine.getTotalPages());
        meta.setTotal(pageVaccine.getTotalElements());
        pagination.setMeta(meta);
        pagination.setResult(pageVaccine.getContent().stream().map(VaccineMapper::toResponse).toList());
        return pagination;
    }

    public VaccineResponse createVaccine(VaccineRequest request) throws AppException {

        if (request.getSlug() == null || request.getSlug().trim().isEmpty()) {
            String slug = generateUniqueSlug(request.getName(), null);
            request.setSlug(slug);
        }


        Vaccine vaccine = VaccineMapper.toEntity(request);
        Vaccine savedVaccine = vaccineRepository.save(vaccine);

        return VaccineMapper.toResponse(savedVaccine);
    }

    public VaccineResponse updateVaccine(Long id, VaccineRequest request) throws AppException {

        Vaccine existingVaccine = vaccineRepository.findById(id)
                .orElseThrow(() -> new AppException("Vaccine not found with id: " + id));


        if (request.getSlug() == null || request.getSlug().trim().isEmpty()) {
            String slug = generateUniqueSlug(request.getName(), id);
            request.setSlug(slug);
        }


        VaccineMapper.updateEntity(existingVaccine, request);
        Vaccine updatedVaccine = vaccineRepository.save(existingVaccine);

        return VaccineMapper.toResponse(updatedVaccine);
    }

    public void deleteVaccine(Long id) throws AppException {
        Vaccine vaccine = vaccineRepository.findById(id)
                .orElseThrow(() -> new AppException("Vaccine not found with id: " + id));


        vaccine.setIsDeleted(true);
        vaccineRepository.save(vaccine);
    }

    public List<Vaccine> getVaccinesByName(String name) {
        return vaccineRepository.findAllByName(name);
    }
}
