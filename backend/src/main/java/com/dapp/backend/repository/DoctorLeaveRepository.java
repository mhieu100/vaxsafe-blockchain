package com.dapp.backend.repository;

import com.dapp.backend.enums.LeaveStatus;
import com.dapp.backend.model.DoctorLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DoctorLeaveRepository extends JpaRepository<DoctorLeave, Long> {
    
    List<DoctorLeave> findByDoctor_DoctorIdAndStatus(Long doctorId, LeaveStatus status);
    
    @Query("SELECT COUNT(dl) > 0 FROM DoctorLeave dl " +
           "WHERE dl.doctor.doctorId = :doctorId " +
           "AND dl.status = 'APPROVED' " +
           "AND :date BETWEEN dl.startDate AND dl.endDate")
    boolean isDoctorOnLeave(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);
    
    @Query("SELECT dl FROM DoctorLeave dl " +
           "WHERE dl.doctor.doctorId = :doctorId " +
           "AND dl.status = 'APPROVED' " +
           "AND dl.endDate >= :startDate " +
           "AND dl.startDate <= :endDate")
    List<DoctorLeave> findOverlappingLeaves(@Param("doctorId") Long doctorId,
                                             @Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate);
}
