package com.dapp.backend.service;

import com.dapp.backend.enums.ReminderChannel;
import com.dapp.backend.enums.ReminderStatus;
import com.dapp.backend.enums.ReminderType;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.*;
import com.dapp.backend.repository.AppointmentRepository;
import com.dapp.backend.repository.VaccinationReminderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VaccinationReminderService {

    private final VaccinationReminderRepository reminderRepository;
    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;
    private final NotificationLogService notificationLogService;

    @Value("${reminder.days.before:1,3,7}")
    private String reminderDaysBeforeConfig;

    /**
     * Create reminders for a new appointment
     */
    @Transactional
    public List<VaccinationReminder> createRemindersForAppointment(Appointment appointment) throws AppException {
        log.info("Creating reminders for appointment ID: {}", appointment.getId());

        List<VaccinationReminder> reminders = new ArrayList<>();

        // Determine recipient user
        User user = appointment.getBooking().getPatient();
        if (user == null) {
            // If booking is for family member, use guardian
            FamilyMember familyMember = appointment.getBooking().getFamilyMember();
            if (familyMember != null && familyMember.getUser() != null) {
                user = familyMember.getUser();
            }
        }

        if (user == null) {
            log.error("No user found for appointment ID: {}", appointment.getId());
            throw new AppException("Cannot create reminders: No user found");
        }

        // Parse reminder days configuration
        List<Integer> daysList = parseDaysBeforeConfig();

        // Get default channels based on user contact info
        Set<ReminderChannel> channels = getAvailableChannels(user);

        LocalDate appointmentDate = appointment.getScheduledDate();

        for (Integer days : daysList) {
            LocalDate reminderDate = appointmentDate.minusDays(days);

            // Only create reminder if date is in the future
            if (reminderDate.isAfter(LocalDate.now()) || reminderDate.isEqual(LocalDate.now())) {
                for (ReminderChannel channel : channels) {
                    // Check if reminder already exists
                    if (!reminderRepository.existsByAppointmentAndChannelAndDaysBefore(
                            appointment.getId(), channel, days)) {

                        VaccinationReminder reminder = VaccinationReminder.builder()
                                .appointment(appointment)
                                .user(user)
                                .reminderType(ReminderType.APPOINTMENT_REMINDER)
                                .channel(channel)
                                .scheduledDate(reminderDate)
                                .daysBefore(days)
                                .status(ReminderStatus.PENDING)
                                .recipientEmail(user.getEmail())
                                .recipientPhone(user.getPhone())
                                .retryCount(0)
                                .build();

                        reminders.add(reminderRepository.save(reminder));
                        log.info("Created {} APPOINTMENT_REMINDER for appointment {} ({} days before)",
                                channel, appointment.getId(), days);
                    }
                }
            }
        }

        log.info("Created {} reminders for appointment ID: {}", reminders.size(), appointment.getId());
        return reminders;
    }

    /**
     * Send pending reminders for today
     */
    @Transactional
    public void sendPendingReminders() {
        log.info("Starting to send pending reminders for today...");

        List<VaccinationReminder> reminders = reminderRepository.findPendingRemindersForToday(LocalDate.now());
        log.info("Found {} pending reminders to send", reminders.size());

        int successCount = 0;
        int failCount = 0;

        for (VaccinationReminder reminder : reminders) {
            try {
                sendReminder(reminder);
                successCount++;
            } catch (Exception e) {
                log.error("Failed to send reminder ID: {}", reminder.getId(), e);
                handleReminderFailure(reminder, e.getMessage());
                failCount++;
            }
        }

        log.info("Finished sending reminders. Success: {}, Failed: {}", successCount, failCount);
    }

    /**
     * Send a single reminder
     */
    @Transactional
    public void sendReminder(VaccinationReminder reminder) throws Exception {
        log.info("Sending reminder ID: {} via {}", reminder.getId(), reminder.getChannel());

        Appointment appointment = reminder.getAppointment();
        Booking booking = appointment.getBooking();

        String patientName = booking.getPatient() != null
                ? booking.getPatient().getFullName()
                : booking.getFamilyMember().getFullName();

        String vaccineName = booking.getVaccine().getName();
        LocalDate appointmentDate = appointment.getScheduledDate();
        String timeSlot = appointment.getScheduledTimeSlot() != null
                ? appointment.getScheduledTimeSlot().name()
                : "Chưa xác định";
        String centerName = appointment.getCenter().getName();
        String centerAddress = appointment.getCenter().getAddress();
        Integer doseNumber = appointment.getDoseNumber();

        // Only EMAIL channel is supported
        if (reminder.getChannel() == ReminderChannel.EMAIL) {
            emailService.sendVaccinationReminder(
                    reminder.getRecipientEmail(),
                    patientName,
                    vaccineName,
                    appointmentDate,
                    timeSlot,
                    centerName,
                    centerAddress,
                    doseNumber
            );
        } else {
            throw new Exception("Unsupported reminder channel: " + reminder.getChannel());
        }

        // Update reminder status
        reminder.setStatus(ReminderStatus.SENT);
        reminder.setSentAt(LocalDateTime.now());
        reminderRepository.save(reminder);

        log.info("Successfully sent reminder ID: {}", reminder.getId());
    }

    /**
     * Retry failed reminders
     */
    @Transactional
    public void retryFailedReminders() {
        log.info("Starting to retry failed reminders...");

        List<VaccinationReminder> reminders = reminderRepository.findFailedRemindersForRetry(LocalDateTime.now());
        log.info("Found {} failed reminders to retry", reminders.size());

        int successCount = 0;
        int failCount = 0;

        for (VaccinationReminder reminder : reminders) {
            try {
                sendReminder(reminder);
                successCount++;
            } catch (Exception e) {
                log.error("Retry failed for reminder ID: {}", reminder.getId(), e);
                handleReminderFailure(reminder, e.getMessage());
                failCount++;
            }
        }

        log.info("Finished retrying reminders. Success: {}, Failed: {}", successCount, failCount);
    }

    /**
     * Cancel reminders for an appointment
     */
    @Transactional
    public void cancelRemindersForAppointment(Long appointmentId) {
        log.info("Cancelling reminders for appointment ID: {}", appointmentId);

        List<VaccinationReminder> reminders = reminderRepository.findByAppointmentId(appointmentId);

        for (VaccinationReminder reminder : reminders) {
            if (reminder.getStatus() == ReminderStatus.PENDING) {
                reminder.setStatus(ReminderStatus.CANCELLED);
                reminderRepository.save(reminder);
            }
        }

        log.info("Cancelled {} reminders for appointment ID: {}", reminders.size(), appointmentId);
    }

    /**
     * Get reminders for a user
     */
    public List<VaccinationReminder> getUserReminders(Long userId) {
        return reminderRepository.findByUserIdOrderByScheduledDateDesc(userId);
    }

    /**
     * Get reminder statistics
     */
    public Map<String, Object> getReminderStatistics(LocalDate startDate, LocalDate endDate) {
        List<Object[]> stats = reminderRepository.getReminderStatistics(startDate, endDate);

        Map<String, Object> result = new HashMap<>();
        Map<String, Map<String, Long>> channelStats = new HashMap<>();

        for (Object[] row : stats) {
            String channel = row[0].toString();
            String status = row[1].toString();
            Long count = (Long) row[2];

            channelStats.computeIfAbsent(channel, k -> new HashMap<>()).put(status, count);
        }

        result.put("channelStats", channelStats);
        result.put("startDate", startDate);
        result.put("endDate", endDate);

        return result;
    }

    // Helper methods

    private List<Integer> parseDaysBeforeConfig() {
        try {
            return Arrays.stream(reminderDaysBeforeConfig.split(","))
                    .map(String::trim)
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error parsing reminder.days.before config, using defaults: 1,3,7", e);
            return Arrays.asList(1, 3, 7);
        }
    }

    private Set<ReminderChannel> getAvailableChannels(User user) {
        Set<ReminderChannel> channels = new HashSet<>();

        // Only EMAIL channel is supported
        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            channels.add(ReminderChannel.EMAIL);
        }

        return channels;
    }

    private void handleReminderFailure(VaccinationReminder reminder, String errorMessage) {
        reminder.setStatus(ReminderStatus.FAILED);
        reminder.setErrorMessage(errorMessage);
        reminder.setRetryCount(reminder.getRetryCount() + 1);

        // Schedule next retry (exponential backoff)
        int retryDelayMinutes = (int) Math.pow(2, reminder.getRetryCount()) * 30; // 30min, 1h, 2h
        reminder.setNextRetryAt(LocalDateTime.now().plusMinutes(retryDelayMinutes));

        reminderRepository.save(reminder);
        log.info("Scheduled retry for reminder ID: {} in {} minutes", reminder.getId(), retryDelayMinutes);
    }
}
