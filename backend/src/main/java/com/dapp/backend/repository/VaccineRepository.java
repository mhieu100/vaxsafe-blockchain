package com.dapp.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.dapp.backend.model.Vaccine;
import org.springframework.data.jpa.repository.Query;

public interface VaccineRepository extends JpaRepository<Vaccine, Long>, JpaSpecificationExecutor<Vaccine> {
    List<Vaccine> findAllByName(String vaccineName);
    Optional<Vaccine> findBySlug(String slug);
    @Query("SELECT DISTINCT country FROM Vaccine")
    List<String> findDistinctCountries();
}
