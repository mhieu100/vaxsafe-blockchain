package com.dapp.backend.repository;

import com.dapp.backend.model.Booking;
import com.dapp.backend.model.User;
import com.dapp.backend.enums.OverRallStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {
    List<Booking> findAllByPatient(User patient);
    List<Booking> findAllByPatientAndOverallStatus(User patient, OverRallStatus overallStatus);
}
