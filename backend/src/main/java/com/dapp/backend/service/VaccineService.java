package com.dapp.backend.service;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Vaccine;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.repository.VaccineRepository;


@Service
public class VaccineService {
    private final VaccineRepository vaccineRepository;

    public VaccineService(VaccineRepository vaccineRepository) {
        this.vaccineRepository = vaccineRepository;
    }

    public List<String> getAllCountries() {
        return vaccineRepository.findDistinctCountries();
    }

    public Vaccine getVaccineBySku(String slug) throws AppException {
        return vaccineRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException("Vaccine not found"));
    }

    public Pagination getAllVaccines(Specification<Vaccine> specification, Pageable pageable) {
        Page<Vaccine> pageVaccine = vaccineRepository.findAll(specification, pageable);
        Pagination pagination = new Pagination();
        Pagination.Meta meta = new Pagination.Meta();

        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());

        meta.setPages(pageVaccine.getTotalPages());
        meta.setTotal(pageVaccine.getTotalElements());

        pagination.setMeta(meta);

        List<Vaccine> listVaccines = new ArrayList<>(pageVaccine.getContent());

        pagination.setResult(listVaccines);

        return pagination;
    }

//    public Vaccine createVaccine(Vaccine vaccine) throws AppException {
//        if (vaccineRepository.existsByName(vaccine.getName())) {
//            throw new AppException("Vaccine already exists with name: " + vaccine.getName());
//        }
//        vaccine.setDeleted(false);
//        return vaccineRepository.save(vaccine);
//    }

//    public Vaccine updateVaccine(Long id, Vaccine vaccine) throws AppException {
//        Vaccine existingVaccine = vaccineRepository.findById(id)
//                .orElseThrow(() -> new AppException("Vaccine not found with id: " + id));
//
//        if (!existingVaccine.getName().equals(vaccine.getName()) &&
//            vaccineRepository.existsByName(vaccine.getName())) {
//            throw new AppException("Vaccine already exists with name: " + vaccine.getName());
//        }
//
//        vaccine.setVaccineId(id);
//        vaccine.setDeleted(existingVaccine.isDeleted());
//        return vaccineRepository.save(vaccine);
//    }
//
//    public void deleteVaccine(Long id) throws AppException {
//        Vaccine vaccine = vaccineRepository.findById(id)
//                .orElseThrow(() -> new AppException("Vaccine not found with id: " + id));
//        vaccine.setDeleted(true);
//        vaccineRepository.save(vaccine);
//    }

    public List<Vaccine> getVaccinesByName(String name) {
        return vaccineRepository.findAllByName(name);
    }
}
