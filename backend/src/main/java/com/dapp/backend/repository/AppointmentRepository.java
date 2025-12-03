package com.dapp.backend.repository;

import com.dapp.backend.enums.AppointmentStatus;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.Booking;
import com.dapp.backend.model.Center;
import com.dapp.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long>, JpaSpecificationExecutor<Appointment>{
    List<Appointment> findByBooking(Booking booking);

    // Find appointments with pending reschedule requests
    List<Appointment> findByStatusAndDesiredDateIsNotNullAndCenter(AppointmentStatus status, Center center);

    // Find appointments without doctor assigned, scheduled within date range
    @Query("SELECT a FROM Appointment a WHERE a.doctor IS NULL " +
            "AND a.status IN :statuses " +
            "AND a.scheduledDate BETWEEN :startDate AND :endDate " +
            "AND a.center = :center")
    List<Appointment> findAppointmentsWithoutDoctor(
            @Param("statuses") List<AppointmentStatus> statuses,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("center") Center center
    );

    // Find appointments for a doctor on a specific date, ordered by time slot
    List<Appointment> findByDoctorAndScheduledDateOrderByScheduledTimeSlotAsc(User doctor, LocalDate scheduledDate);
}
