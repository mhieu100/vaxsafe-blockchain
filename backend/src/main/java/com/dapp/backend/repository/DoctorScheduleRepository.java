package com.dapp.backend.repository;

import com.dapp.backend.model.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
    
    List<DoctorSchedule> findByDoctor_DoctorIdAndIsActiveTrue(Long doctorId);
    
    @Query("SELECT ds FROM DoctorSchedule ds " +
           "WHERE ds.doctor.doctorId = :doctorId " +
           "AND ds.dayOfWeek = :dayOfWeek " +
           "AND ds.isActive = true")
    List<DoctorSchedule> findActiveDaySchedules(@Param("doctorId") Long doctorId, 
                                                 @Param("dayOfWeek") Integer dayOfWeek);
}
