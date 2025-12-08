package com.dapp.backend.service;

import com.dapp.backend.enums.ReminderChannel;
import com.dapp.backend.enums.ReminderStatus;
import com.dapp.backend.enums.ReminderType;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.*;
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


@Service
@RequiredArgsConstructor
@Slf4j
public class NextDoseReminderService {

    private final VaccinationReminderRepository reminderRepository;
    private final VaccineRepository vaccineRepository;
    private final EmailService emailService;
    private final NotificationLogService notificationLogService;

    
    @Transactional
    public List<VaccinationReminder> createNextDoseReminder(Appointment completedAppointment) throws AppException {
        log.info("Creating next dose reminder for completed appointment ID: {}", completedAppointment.getId());

        List<VaccinationReminder> reminders = new ArrayList<>();

        Booking booking = completedAppointment.getBooking();
        Vaccine vaccine = booking.getVaccine();
        int currentDose = completedAppointment.getDoseNumber();
        int requiredDoses = vaccine.getDosesRequired();


        if (currentDose >= requiredDoses) {
            log.info("No next dose needed. Current dose {} >= required doses {}", currentDose, requiredDoses);
            return reminders;
        }


        LocalDate completedDate = completedAppointment.getScheduledDate();
        LocalDate nextDoseDate = completedDate.plusDays(vaccine.getDuration());

        log.info("Next dose #{} should be scheduled around: {} ({}days after dose #{})",
                currentDose + 1, nextDoseDate, vaccine.getDuration(), currentDose);


        User user = booking.getPatient();
        if (user == null && booking.getFamilyMember() != null) {
            user = booking.getFamilyMember().getUser();
        }

        if (user == null) {
            log.error("No user found for booking ID: {}", booking.getBookingId());
            return reminders;
        }


        UserNotificationSetting settings = notificationLogService.getUserSettings(user);
        if (!settings.getNextDoseReminderEnabled()) {
            log.info("Next dose reminders disabled for user ID: {}", user.getId());
            return reminders;
        }


        Set<ReminderChannel> channels = getAvailableChannels(user, settings);


        for (ReminderChannel channel : channels) {

            if (!notificationLogService.isNotificationAllowed(user, ReminderType.NEXT_DOSE_REMINDER, channel)) {
                log.info("Channel {} disabled for user ID: {}", channel, user.getId());
                continue;
            }


            if (notificationLogService.wasRecentlySent(user, ReminderType.NEXT_DOSE_REMINDER, 
                    channel, null, 24 * 7)) {
                log.info("Next dose reminder already sent recently to user ID: {} via {}", user.getId(), channel);
                continue;
            }

            VaccinationReminder reminder = VaccinationReminder.builder()
                    .appointment(null)
                    .user(user)
                    .reminderType(ReminderType.NEXT_DOSE_REMINDER)
                    .channel(channel)
                    .scheduledDate(nextDoseDate)
                    .daysBefore(null)
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

    
    @Transactional
    public void sendNextDoseReminders() {
        log.info("Starting to send next dose reminders for today...");


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

    
    @Transactional
    public void sendNextDoseReminder(VaccinationReminder reminder) throws Exception {
        log.info("Sending next dose reminder ID: {} via {}", reminder.getId(), reminder.getChannel());

        User user = reminder.getUser();
        Vaccine vaccine = vaccineRepository.findById(reminder.getVaccineId())
                .orElseThrow(() -> new Exception("Vaccine not found: " + reminder.getVaccineId()));

        String patientName = user.getFullName();
        String vaccineName = vaccine.getName();
        int nextDoseNumber = reminder.getNextDoseNumber();


        if (reminder.getChannel() == ReminderChannel.EMAIL) {
            String content = buildNextDoseEmailContent(patientName, vaccineName, nextDoseNumber);
            
            emailService.sendNextDoseReminder(
                    reminder.getRecipientEmail(),
                    patientName,
                    vaccineName,
                    nextDoseNumber
            );


            reminder.setStatus(ReminderStatus.SENT);
            reminder.setSentAt(java.time.LocalDateTime.now());
            reminderRepository.save(reminder);


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


        if (reminder.getRetryCount() < 3) {
            int retryDelayMinutes = switch (reminder.getRetryCount()) {
                case 1 -> 30;
                case 2 -> 60;
                default -> 120;
            };
            reminder.setNextRetryAt(java.time.LocalDateTime.now().plusMinutes(retryDelayMinutes));
        }

        reminderRepository.save(reminder);


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
