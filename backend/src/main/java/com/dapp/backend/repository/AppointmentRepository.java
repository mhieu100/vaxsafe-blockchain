package com.dapp.backend.repository;

import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long>, JpaSpecificationExecutor<Appointment>{
    List<Appointment> findByBooking(Booking booking);
}
