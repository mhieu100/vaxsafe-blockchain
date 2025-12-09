package com.dapp.backend.repository;

import com.dapp.backend.enums.AppointmentStatus;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.Center;
import com.dapp.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long>, JpaSpecificationExecutor<Appointment> {

        List<Appointment> findByPatientAndStatusIn(User patient, List<AppointmentStatus> statuses);

        List<Appointment> findByPatient(User patient);

        List<Appointment> findByStatusAndDesiredDateIsNotNullAndCenter(AppointmentStatus status, Center center);

        @Query("SELECT a FROM Appointment a WHERE a.doctor IS NULL " +
                        "AND a.status IN :statuses " +
                        "AND a.scheduledDate BETWEEN :startDate AND :endDate " +
                        "AND a.center = :center")
        List<Appointment> findAppointmentsWithoutDoctor(
                        @Param("statuses") List<AppointmentStatus> statuses,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        @Param("center") Center center);

        List<Appointment> findByDoctorAndScheduledDateOrderByScheduledTimeSlotAsc(User doctor, LocalDate scheduledDate);

        @Query("SELECT a.scheduledDate, COUNT(a) FROM Appointment a WHERE a.scheduledDate >= :startDate GROUP BY a.scheduledDate ORDER BY a.scheduledDate")
        List<Object[]> countAppointmentsByDateSince(@Param("startDate") LocalDate startDate);

        long countByDoctorAndScheduledDate(User doctor, LocalDate date);

        long countByDoctorAndScheduledDateBetween(User doctor, LocalDate startDate, LocalDate endDate);

        long countByDoctorAndStatusAndScheduledDateBetween(User doctor, AppointmentStatus status, LocalDate startDate,
                        LocalDate endDate);

        Appointment findFirstByDoctorAndStatusAndScheduledDateGreaterThanEqualOrderByScheduledDateAscScheduledTimeSlotAsc(
                        User doctor, AppointmentStatus status, LocalDate date);

        long countByCenterAndStatus(Center center, AppointmentStatus status);

        long countByCenterAndScheduledDate(Center center, LocalDate date);

        long countByCenterAndStatusAndScheduledDateBetween(Center center, AppointmentStatus status, LocalDate startDate,
                        LocalDate endDate);

        @Query("SELECT a.scheduledTimeSlot, COUNT(a) FROM Appointment a " +
                        "WHERE a.center.centerId = :centerId AND a.scheduledDate = :date " +
                        "AND a.status != 'CANCELLED' " +
                        "GROUP BY a.scheduledTimeSlot")
        List<Object[]> countAppointmentsBySlot(@Param("centerId") Long centerId, @Param("date") LocalDate date);

        @Query("SELECT MAX(a.doseNumber) FROM Appointment a WHERE a.patient.id = :patientId AND a.vaccine.id = :vaccineId AND "
                        +
                        "((:familyMemberId IS NULL AND a.familyMember IS NULL) OR (:familyMemberId IS NOT NULL AND a.familyMember.id = :familyMemberId)) "
                        +
                        "AND a.status != 'CANCELLED'")
        Integer findMaxDose(@Param("patientId") Long patientId, @Param("vaccineId") Long vaccineId,
                        @Param("familyMemberId") Long familyMemberId);
}
