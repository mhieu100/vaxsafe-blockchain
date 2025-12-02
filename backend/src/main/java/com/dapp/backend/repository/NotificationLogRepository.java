package com.dapp.backend.repository;

import com.dapp.backend.enums.ReminderChannel;
import com.dapp.backend.enums.ReminderType;
import com.dapp.backend.model.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {

    // Check if notification was already sent to prevent duplicates
    @Query("""
        SELECT COUNT(nl) > 0 FROM NotificationLog nl
        WHERE nl.user.id = :userId
        AND nl.reminderType = :type
        AND nl.channel = :channel
        AND (:appointmentId IS NULL OR nl.appointment.id = :appointmentId)
        AND nl.sentAt >= :since
        """)
    boolean existsRecentNotification(
            @Param("userId") Long userId,
            @Param("type") ReminderType type,
            @Param("channel") ReminderChannel channel,
            @Param("appointmentId") Long appointmentId,
            @Param("since") LocalDateTime since
    );

    // Get notification history for user
    List<NotificationLog> findByUser_IdOrderBySentAtDesc(Long userId);

    // Get logs by appointment
    List<NotificationLog> findByAppointment_IdOrderBySentAtDesc(Long appointmentId);
}
