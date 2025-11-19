package com.dapp.backend.repository;

import com.dapp.backend.model.DoctorSpecialSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DoctorSpecialScheduleRepository extends JpaRepository<DoctorSpecialSchedule, Long> {
    
    Optional<DoctorSpecialSchedule> findByDoctor_DoctorIdAndWorkDate(Long doctorId, LocalDate workDate);
}
