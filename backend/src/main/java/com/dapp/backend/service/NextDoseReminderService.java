package com.dapp.backend.service;

import com.dapp.backend.enums.ReminderChannel;
import com.dapp.backend.enums.ReminderStatus;
import com.dapp.backend.enums.ReminderType;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.*;
import com.dapp.backend.repository.AppointmentRepository;
import com.dapp.backend.repository.VaccinationReminderRepository;
import com.dapp.backend.repository.VaccineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Service to create Next Dose Reminders based on vaccine protocol
 * Nhắc nhở mũi tiếp theo dựa trên phác đồ vaccine
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NextDoseReminderService {

    private final VaccinationReminderRepository reminderRepository;
    private final AppointmentRepository appointmentRepository;
    private final VaccineRepository vaccineRepository;
    private final EmailService emailService;
    private final NotificationLogService notificationLogService;

    /**
     * Create next dose reminder after completing an appointment
     * Called when appointment status = COMPLETED
     * @throws AppException 
     */
    @Transactional
    public List<VaccinationReminder> createNextDoseReminder(Appointment completedAppointment) throws AppException {
        log.info("Creating next dose reminder for completed appointment ID: {}", completedAppointment.getId());

        List<VaccinationReminder> reminders = new ArrayList<>();

        Booking booking = completedAppointment.getBooking();
        Vaccine vaccine = booking.getVaccine();
        int currentDose = completedAppointment.getDoseNumber();
        int requiredDoses = vaccine.getDosesRequired();

        // Check if there's a next dose
        if (currentDose >= requiredDoses) {
            log.info("No next dose needed. Current dose {} >= required doses {}", currentDose, requiredDoses);
            return reminders;
        }

        // Calculate next dose date based on vaccine protocol (duration in days)
        LocalDate completedDate = completedAppointment.getScheduledDate();
        LocalDate nextDoseDate = completedDate.plusDays(vaccine.getDuration());

        log.info("Next dose #{} should be scheduled around: {} ({}days after dose #{})",
                currentDose + 1, nextDoseDate, vaccine.getDuration(), currentDose);

        // Determine recipient user
        User user = booking.getPatient();
        if (user == null && booking.getFamilyMember() != null) {
            user = booking.getFamilyMember().getUser();
        }

        if (user == null) {
            log.error("No user found for booking ID: {}", booking.getBookingId());
            return reminders;
        }

        // Check user notification preferences
        UserNotificationSetting settings = notificationLogService.getUserSettings(user);
        if (!settings.getNextDoseReminderEnabled()) {
            log.info("Next dose reminders disabled for user ID: {}", user.getId());
            return reminders;
        }

        // Get available channels
        Set<ReminderChannel> channels = getAvailableChannels(user, settings);

        // Create reminder for each channel
        for (ReminderChannel channel : channels) {
            // Check if user allows this channel
            if (!notificationLogService.isNotificationAllowed(user, ReminderType.NEXT_DOSE_REMINDER, channel)) {
                log.info("Channel {} disabled for user ID: {}", channel, user.getId());
                continue;
            }

            // Check if reminder was recently sent (prevent duplicates)
            if (notificationLogService.wasRecentlySent(user, ReminderType.NEXT_DOSE_REMINDER, 
                    channel, null, 24 * 7)) { // 7 days window
                log.info("Next dose reminder already sent recently to user ID: {} via {}", user.getId(), channel);
                continue;
            }

            VaccinationReminder reminder = VaccinationReminder.builder()
                    .appointment(null) // No specific appointment yet
                    .user(user)
                    .reminderType(ReminderType.NEXT_DOSE_REMINDER)
                    .channel(channel)
                    .scheduledDate(nextDoseDate)
                    .daysBefore(null) // Not applicable for next dose
                    .vaccineId(vaccine.getId())
                    .nextDoseNumber(currentDose + 1)
                    .status(ReminderStatus.PENDING)
                    .recipientEmail(user.getEmail())
                    .recipientPhone(user.getPhone())
                    .retryCount(0)
                    .build();

            reminders.add(reminderRepository.save(reminder));
            log.info("Created NEXT_DOSE_REMINDER for user {} via {}: Dose #{} on {}",
                    user.getId(), channel, currentDose + 1, nextDoseDate);
        }

        return reminders;
    }

    /**
     * Send next dose reminders that are due today
     */
    @Transactional
    public void sendNextDoseReminders() {
        log.info("Starting to send next dose reminders for today...");

        // Find pending next dose reminders scheduled for today
        List<VaccinationReminder> reminders = reminderRepository
                .findByReminderTypeAndScheduledDateAndStatus(
                        ReminderType.NEXT_DOSE_REMINDER,
                        LocalDate.now(),
                        ReminderStatus.PENDING
                );

        log.info("Found {} next dose reminders to send", reminders.size());

        int successCount = 0;
        int failCount = 0;

        for (VaccinationReminder reminder : reminders) {
            try {
                sendNextDoseReminder(reminder);
                successCount++;
            } catch (Exception e) {
                log.error("Failed to send next dose reminder ID: {}", reminder.getId(), e);
                handleReminderFailure(reminder, e.getMessage());
                failCount++;
            }
        }

        log.info("Finished sending next dose reminders. Success: {}, Failed: {}", successCount, failCount);
    }

    /**
     * Send a single next dose reminder
     */
    @Transactional
    public void sendNextDoseReminder(VaccinationReminder reminder) throws Exception {
        log.info("Sending next dose reminder ID: {} via {}", reminder.getId(), reminder.getChannel());

        User user = reminder.getUser();
        Vaccine vaccine = vaccineRepository.findById(reminder.getVaccineId())
                .orElseThrow(() -> new Exception("Vaccine not found: " + reminder.getVaccineId()));

        String patientName = user.getFullName();
        String vaccineName = vaccine.getName();
        int nextDoseNumber = reminder.getNextDoseNumber();

        // Only EMAIL supported for now
        if (reminder.getChannel() == ReminderChannel.EMAIL) {
            String content = buildNextDoseEmailContent(patientName, vaccineName, nextDoseNumber);
            
            emailService.sendNextDoseReminder(
                    reminder.getRecipientEmail(),
                    patientName,
                    vaccineName,
                    nextDoseNumber
            );

            // Mark as sent
            reminder.setStatus(ReminderStatus.SENT);
            reminder.setSentAt(java.time.LocalDateTime.now());
            reminderRepository.save(reminder);

            // Log success
            notificationLogService.logSuccess(
                    user,
                    ReminderType.NEXT_DOSE_REMINDER,
                    ReminderChannel.EMAIL,
                    null,
                    reminder.getRecipientEmail(),
                    content
            );

            log.info("Successfully sent next dose reminder ID: {}", reminder.getId());
        } else {
            throw new Exception("Unsupported channel: " + reminder.getChannel());
        }
    }

    private void handleReminderFailure(VaccinationReminder reminder, String errorMessage) {
        reminder.setStatus(ReminderStatus.FAILED);
        reminder.setErrorMessage(errorMessage);
        reminder.setRetryCount(reminder.getRetryCount() + 1);

        // Schedule retry with exponential backoff
        if (reminder.getRetryCount() < 3) {
            int retryDelayMinutes = switch (reminder.getRetryCount()) {
                case 1 -> 30;
                case 2 -> 60;
                default -> 120;
            };
            reminder.setNextRetryAt(java.time.LocalDateTime.now().plusMinutes(retryDelayMinutes));
        }

        reminderRepository.save(reminder);

        // Log failure
        notificationLogService.logFailure(
                reminder.getUser(),
                ReminderType.NEXT_DOSE_REMINDER,
                reminder.getChannel(),
                null,
                reminder.getRecipientEmail(),
                errorMessage
        );
    }

    private Set<ReminderChannel> getAvailableChannels(User user, UserNotificationSetting settings) {
        Set<ReminderChannel> channels = new java.util.HashSet<>();
        
        if (user.getEmail() != null && !user.getEmail().isEmpty() && settings.getEmailEnabled()) {
            channels.add(ReminderChannel.EMAIL);
        }

        return channels;
    }

    private String buildNextDoseEmailContent(String patientName, String vaccineName, int doseNumber) {
        return String.format(
                "Kính gửi %s,\n\n" +
                "Đã đến thời gian tiêm mũi %d của vaccine %s.\n" +
                "Vui lòng đăng nhập vào hệ thống VaxSafe để đặt lịch hẹn.\n\n" +
                "Trân trọng,\nVaxSafe Team",
                patientName, doseNumber, vaccineName
        );
    }
}
