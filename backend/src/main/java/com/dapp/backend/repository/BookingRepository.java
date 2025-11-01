package com.dapp.backend.repository;

import com.dapp.backend.enums.BookingEnum;
import com.dapp.backend.model.Booking;
import com.dapp.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {
    List<Booking> findAllByPatient(User patient);
    List<Booking> findAllByPatientAndStatus(User patient, BookingEnum status);
}
