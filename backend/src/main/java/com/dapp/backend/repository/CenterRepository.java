package com.dapp.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.dapp.backend.model.Center;

import java.util.Optional;

public interface CenterRepository extends JpaRepository<Center, Long>, JpaSpecificationExecutor<Center> {
    Optional<Center> findBySlug(String slug);
    
    boolean existsByName(String name);
    
    @Query("SELECT DISTINCT c.address FROM Center c WHERE c.isDeleted = false ORDER BY c.address")
    java.util.List<String> findDistinctAddresses();
}
