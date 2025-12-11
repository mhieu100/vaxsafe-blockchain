package com.dapp.backend.repository;

import com.dapp.backend.enums.ReminderChannel;
import com.dapp.backend.enums.ReminderStatus;
import com.dapp.backend.enums.ReminderType;
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

        List<VaccinationReminder> findByAppointmentId(Long appointmentId);

        List<VaccinationReminder> findByUserIdOrderByScheduledDateDesc(Long userId);

        @Query("""
                        SELECT vr FROM VaccinationReminder vr
                        WHERE vr.status = 'PENDING'
                        AND vr.scheduledDate = :today
                        AND vr.appointment.status IN ('SCHEDULED', 'CONFIRMED')
                        """)
        List<VaccinationReminder> findPendingRemindersForToday(@Param("today") LocalDate today);

        @Query("""
                        SELECT vr FROM VaccinationReminder vr
                        WHERE vr.status = 'FAILED'
                        AND vr.nextRetryAt <= :now
                        AND vr.retryCount < 3
                        """)
        List<VaccinationReminder> findFailedRemindersForRetry(@Param("now") LocalDateTime now);

        List<VaccinationReminder> findByStatusOrderByScheduledDateDesc(ReminderStatus status);

        List<VaccinationReminder> findByReminderTypeAndScheduledDateAndStatus(
                        ReminderType reminderType,
                        LocalDate scheduledDate,
                        ReminderStatus status);

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

        void deleteByAppointmentIdAndStatus(Long appointmentId, ReminderStatus status);

        @Query("""
                        SELECT COUNT(vr) > 0 FROM VaccinationReminder vr
                        WHERE vr.appointment.id = :appointmentId
                        AND vr.channel = :channel
                        AND vr.daysBefore = :daysBefore
                        AND vr.status = :status
                        """)
        boolean existsByAppointmentAndChannelAndDaysBeforeAndStatus(
                        @Param("appointmentId") Long appointmentId,
                        @Param("channel") ReminderChannel channel,
                        @Param("daysBefore") Integer daysBefore,
                        @Param("status") ReminderStatus status);

        @Query("""
                        SELECT vr.channel, vr.status, COUNT(vr)
                        FROM VaccinationReminder vr
                        WHERE vr.scheduledDate BETWEEN :startDate AND :endDate
                        GROUP BY vr.channel, vr.status
                        """)
        List<Object[]> getReminderStatistics(
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);
}
