package com.dapp.backend.repository;

import com.dapp.backend.enums.ReminderChannel;
import com.dapp.backend.enums.ReminderStatus;
import com.dapp.backend.model.VaccinationReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VaccinationReminderRepository extends JpaRepository<VaccinationReminder, Long> {

    // Find reminders by appointment
    List<VaccinationReminder> findByAppointmentId(Long appointmentId);

    // Find reminders by user
    List<VaccinationReminder> findByUserIdOrderByScheduledDateDesc(Long userId);

    // Find pending reminders that should be sent today
    @Query("""
        SELECT vr FROM VaccinationReminder vr 
        WHERE vr.status = 'PENDING' 
        AND vr.scheduledDate = :today
        AND vr.appointment.status IN ('SCHEDULED', 'CONFIRMED')
        """)
    List<VaccinationReminder> findPendingRemindersForToday(@Param("today") LocalDate today);

    // Find failed reminders that need retry
    @Query("""
        SELECT vr FROM VaccinationReminder vr 
        WHERE vr.status = 'FAILED' 
        AND vr.nextRetryAt <= :now
        AND vr.retryCount < 3
        """)
    List<VaccinationReminder> findFailedRemindersForRetry(@Param("now") LocalDateTime now);

    // Find reminders by status
    List<VaccinationReminder> findByStatusOrderByScheduledDateDesc(ReminderStatus status);

    // Find next dose reminders by date and status
    List<VaccinationReminder> findByReminderTypeAndScheduledDateAndStatus(
            com.dapp.backend.enums.ReminderType reminderType, 
            LocalDate scheduledDate, 
            ReminderStatus status);

    // Check if reminder exists
    @Query("""
        SELECT COUNT(vr) > 0 FROM VaccinationReminder vr 
        WHERE vr.appointment.id = :appointmentId 
        AND vr.channel = :channel 
        AND vr.daysBefore = :daysBefore
        """)
    boolean existsByAppointmentAndChannelAndDaysBefore(
            @Param("appointmentId") Long appointmentId, 
            @Param("channel") ReminderChannel channel, 
            @Param("daysBefore") Integer daysBefore);

    // Get statistics
    @Query("""
        SELECT vr.channel, vr.status, COUNT(vr) 
        FROM VaccinationReminder vr 
        WHERE vr.scheduledDate BETWEEN :startDate AND :endDate
        GROUP BY vr.channel, vr.status
        """)
    List<Object[]> getReminderStatistics(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
