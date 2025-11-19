package com.dapp.backend.repository;

import com.dapp.backend.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    
    Optional<Doctor> findByUser_Id(Long userId);
    
    List<Doctor> findByCenter_CenterIdAndIsAvailableTrue(Long centerId);
    
    @Query("SELECT d FROM Doctor d WHERE d.isAvailable = true")
    List<Doctor> findAllAvailable();
    
    @Query("SELECT d FROM Doctor d " +
           "JOIN d.user u " +
           "WHERE d.center.centerId = :centerId " +
           "AND d.isAvailable = true " +
           "AND LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Doctor> searchByNameAndCenter(@Param("keyword") String keyword, @Param("centerId") Long centerId);
}
