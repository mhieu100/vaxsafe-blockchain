package com.dapp.backend.repository;

import com.dapp.backend.enums.AppointmentEnum;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.Booking;
import com.dapp.backend.model.Center;
import com.dapp.backend.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long>, JpaSpecificationExecutor<Appointment>{
    List<Appointment> findByBooking(Booking booking);

    // Find appointments with pending reschedule requests
    List<Appointment> findByStatusAndDesiredDateIsNotNullAndCenter(AppointmentEnum status, Center center);

    // Find appointments without doctor assigned, scheduled within date range
    @Query("SELECT a FROM Appointment a WHERE a.doctor IS NULL " +
            "AND a.status IN :statuses " +
            "AND a.scheduledDate BETWEEN :startDate AND :endDate " +
            "AND a.center = :center")
    List<Appointment> findAppointmentsWithoutDoctor(
            @Param("statuses") List<AppointmentEnum> statuses,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("center") Center center
    );

    // Find appointments coming soon (within hours)
    @Query("SELECT a FROM Appointment a WHERE a.status = :status " +
            "AND a.scheduledDate = :date " +
            "AND a.scheduledTime BETWEEN :startTime AND :endTime " +
            "AND a.center = :center")
    List<Appointment> findAppointmentsComingSoon(
            @Param("status") AppointmentEnum status,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("center") Center center
    );

    // Find overdue appointments
    @Query("SELECT a FROM Appointment a WHERE a.status IN :statuses " +
            "AND ((a.scheduledDate < :currentDate) OR " +
            "(a.scheduledDate = :currentDate AND a.scheduledTime < :currentTime)) " +
            "AND a.center = :center")
    List<Appointment> findOverdueAppointments(
            @Param("statuses") List<AppointmentEnum> statuses,
            @Param("currentDate") LocalDate currentDate,
            @Param("currentTime") LocalTime currentTime,
            @Param("center") Center center
    );

    // Find appointments for a doctor on a specific date, ordered by time
    List<Appointment> findByDoctorAndScheduledDateOrderByScheduledTimeAsc(Doctor doctor, LocalDate scheduledDate);
}
