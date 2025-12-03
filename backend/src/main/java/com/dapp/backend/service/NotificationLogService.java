package com.dapp.backend.service;

import com.dapp.backend.enums.ReminderChannel;
import com.dapp.backend.enums.ReminderStatus;
import com.dapp.backend.enums.ReminderType;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.*;
import com.dapp.backend.repository.NotificationLogRepository;
import com.dapp.backend.repository.UserNotificationSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service to manage notification logs and prevent spam/duplicate sends
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationLogService {

    private final NotificationLogRepository logRepository;
    private final UserNotificationSettingRepository settingRepository;

    /**
     * Check if user allows this type of notification
     */
    public boolean isNotificationAllowed(User user, ReminderType type, ReminderChannel channel) {
        UserNotificationSetting setting = settingRepository.findByUserId(user.getId())
                .orElse(createDefaultSettings(user));

        // Check if reminder type is enabled
        if (type == ReminderType.APPOINTMENT_REMINDER && !setting.getAppointmentReminderEnabled()) {
            log.info("Appointment reminders disabled for user ID: {}", user.getId());
            return false;
        }
        if (type == ReminderType.NEXT_DOSE_REMINDER && !setting.getNextDoseReminderEnabled()) {
            log.info("Next dose reminders disabled for user ID: {}", user.getId());
            return false;
        }

        // Check if channel is enabled
        switch (channel) {
            case EMAIL:
                return setting.getEmailEnabled();
            // Future: Add SMS, ZALO checks
            default:
                return false;
        }
    }

    /**
     * Check if notification was recently sent to prevent spam
     * @param hoursWindow Time window to check for recent sends (e.g., 24 hours)
     */
    public boolean wasRecentlySent(User user, ReminderType type, ReminderChannel channel, 
                                    Long appointmentId, int hoursWindow) {
        LocalDateTime since = LocalDateTime.now().minusHours(hoursWindow);
        return logRepository.existsRecentNotification(user.getId(), type, channel, appointmentId, since);
    }

    /**
     * Log a successful notification send
     */
    @Transactional
    public void logSuccess(User user, ReminderType type, ReminderChannel channel, 
                          Appointment appointment, String recipient, String content) {
        NotificationLog log = NotificationLog.builder()
                .user(user)
                .appointment(appointment)
                .reminderType(type)
                .channel(channel)
                .status(ReminderStatus.SENT)
                .sentAt(LocalDateTime.now())
                .recipient(recipient)
                .content(content)
                .build();

        if (appointment != null) {
            log.setDoseNumber(appointment.getDoseNumber());
            log.setVaccineId(appointment.getBooking().getVaccine().getId());
        }

        logRepository.save(log);
        this.log.info("Logged successful {} notification to {} via {}", type, recipient, channel);
    }

    /**
     * Log a failed notification attempt
     */
    @Transactional
    public void logFailure(User user, ReminderType type, ReminderChannel channel,
                          Appointment appointment, String recipient, String errorMessage) {
        NotificationLog log = NotificationLog.builder()
                .user(user)
                .appointment(appointment)
                .reminderType(type)
                .channel(channel)
                .status(ReminderStatus.FAILED)
                .sentAt(LocalDateTime.now())
                .recipient(recipient)
                .errorMessage(errorMessage)
                .build();

        logRepository.save(log);
        this.log.error("Logged failed {} notification to {} via {}: {}", type, recipient, channel, errorMessage);
    }

    /**
     * Create default settings for new user
     */
    private UserNotificationSetting createDefaultSettings(User user) {
        UserNotificationSetting setting = UserNotificationSetting.builder()
                .user(user)
                .emailEnabled(true)
                .smsEnabled(false)
                .zaloEnabled(false)
                .preferredChannel(ReminderChannel.EMAIL)
                .appointmentReminderEnabled(true)
                .nextDoseReminderEnabled(true)
                .build();
        
        return settingRepository.save(setting);
    }

    /**
     * Get user notification settings
     * @throws AppException 
     */
    public UserNotificationSetting getUserSettings(User user) throws AppException {
        Optional<UserNotificationSetting> existing = settingRepository.findByUserId(user.getId());
        if (existing.isPresent()) {
            return existing.get();
        }
        
        // Double-check to handle race condition
        try {
            return createDefaultSettings(user);
        } catch (DataIntegrityViolationException e) {
            // Another thread created it, fetch again
            return settingRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new AppException("Failed to get user notification settings"));
        }
    }
}
