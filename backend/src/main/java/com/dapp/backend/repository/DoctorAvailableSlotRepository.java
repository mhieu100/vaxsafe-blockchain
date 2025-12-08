package com.dapp.backend.repository;

import com.dapp.backend.enums.SlotStatus;
import com.dapp.backend.model.DoctorAvailableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorAvailableSlotRepository extends JpaRepository<DoctorAvailableSlot, Long> {
    
    List<DoctorAvailableSlot> findByDoctor_DoctorIdAndSlotDateAndStatus(
        Long doctorId, LocalDate slotDate, SlotStatus status
    );
    
    @Query("SELECT s FROM DoctorAvailableSlot s " +
           "WHERE s.doctor.doctorId = :doctorId " +
           "AND s.slotDate = :date " +
           "AND s.status = 'AVAILABLE' " +
           "ORDER BY s.startTime")
    List<DoctorAvailableSlot> findAvailableSlots(@Param("doctorId") Long doctorId, 
                                                   @Param("date") LocalDate date);
    
    @Query("SELECT s FROM DoctorAvailableSlot s " +
           "WHERE s.doctor.center.centerId = :centerId " +
           "AND s.slotDate = :date " +
           "AND s.status = 'AVAILABLE' " +
           "ORDER BY s.doctor.doctorId, s.startTime")
    List<DoctorAvailableSlot> findAvailableSlotsByCenter(@Param("centerId") Long centerId, 
                                                           @Param("date") LocalDate date);
    
    @Query("SELECT s FROM DoctorAvailableSlot s " +
           "WHERE s.doctor.center.centerId = :centerId " +
           "AND s.slotDate = :date " +
           "AND s.startTime >= :startTime " +
           "AND s.startTime < :endTime " +
           "AND s.status = 'AVAILABLE' " +
           "ORDER BY s.startTime, s.doctor.doctorId")
    List<DoctorAvailableSlot> findAvailableSlotsByCenterAndTimeRange(
        @Param("centerId") Long centerId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime);
    
    Optional<DoctorAvailableSlot> findByDoctor_DoctorIdAndSlotDateAndStartTime(
        Long doctorId, LocalDate slotDate, LocalTime startTime
    );
    
    
    @Query("SELECT s FROM DoctorAvailableSlot s " +
           "WHERE s.doctor.doctorId = :doctorId " +
           "AND s.slotDate = :slotDate " +
           "AND s.startTime = :startTime")
    Optional<DoctorAvailableSlot> findByDoctorIdAndSlotDateAndStartTime(
        @Param("doctorId") Long doctorId,
        @Param("slotDate") LocalDate slotDate,
        @Param("startTime") LocalTime startTime
    );
    
    
    @Query("SELECT s FROM DoctorAvailableSlot s " +
           "WHERE s.doctor.doctorId = :doctorId " +
           "AND s.slotDate BETWEEN :startDate AND :endDate " +
           "AND s.status IN ('BOOKED', 'BLOCKED') " +
           "ORDER BY s.slotDate, s.startTime")
    List<DoctorAvailableSlot> findDoctorSlotsInRange(@Param("doctorId") Long doctorId,
                                                       @Param("startDate") LocalDate startDate,
                                                       @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(s) FROM DoctorAvailableSlot s " +
           "WHERE s.doctor.doctorId = :doctorId " +
           "AND s.slotDate = :date " +
           "AND s.status = 'AVAILABLE'")
    long countAvailableSlots(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);
    
    
    @Query("SELECT s FROM DoctorAvailableSlot s " +
           "WHERE s.doctor.doctorId IN :doctorIds " +
           "AND s.slotDate BETWEEN :startDate AND :endDate " +
           "AND s.status IN ('BOOKED', 'BLOCKED') " +
           "ORDER BY s.doctor.doctorId, s.slotDate, s.startTime")
    List<DoctorAvailableSlot> findSlotsByDoctorIdsAndDateRange(
        @Param("doctorIds") List<Long> doctorIds,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);
}
