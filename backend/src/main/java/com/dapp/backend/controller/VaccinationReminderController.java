package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.model.VaccinationReminder;
import com.dapp.backend.service.VaccinationReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
@Slf4j
public class VaccinationReminderController {

    private final VaccinationReminderService reminderService;

    /**
     * Get all reminders for current user
     * GET /api/reminders/my-reminders
     */
    @GetMapping("/my-reminders")
    @ApiMessage("Get user reminders")
    @PreAuthorize("hasRole('ROLE_PATIENT')")
    public ResponseEntity<List<VaccinationReminder>> getMyReminders(@RequestParam Long userId) {
        log.info("Request to get reminders for user ID: {}", userId);
        List<VaccinationReminder> reminders = reminderService.getUserReminders(userId);
        return ResponseEntity.ok(reminders);
    }

    /**
     * Get reminders by appointment
     * GET /api/reminders/appointment/{appointmentId}
     */
    @GetMapping("/appointment/{appointmentId}")
    @ApiMessage("Get appointment reminders")
    public ResponseEntity<List<VaccinationReminder>> getAppointmentReminders(
            @PathVariable Long appointmentId) {
        log.info("Request to get reminders for appointment ID: {}", appointmentId);
        // Implementation would call repository method
        return ResponseEntity.ok(List.of());
    }

    /**
     * Manually trigger sending pending reminders (Admin only)
     * POST /api/reminders/send-pending
     */
    @PostMapping("/send-pending")
    @ApiMessage("Send pending reminders")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> sendPendingReminders() {
        log.info("Manual trigger to send pending reminders");
        
        try {
            reminderService.sendPendingReminders();
            return ResponseEntity.ok(Map.of("message", "Pending reminders sent successfully"));
        } catch (Exception e) {
            log.error("Error sending pending reminders", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Retry failed reminders (Admin only)
     * POST /api/reminders/retry-failed
     */
    @PostMapping("/retry-failed")
    @ApiMessage("Retry failed reminders")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> retryFailedReminders() {
        log.info("Manual trigger to retry failed reminders");
        
        try {
            reminderService.retryFailedReminders();
            return ResponseEntity.ok(Map.of("message", "Failed reminders retried successfully"));
        } catch (Exception e) {
            log.error("Error retrying failed reminders", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cancel reminders for an appointment
     * DELETE /api/reminders/appointment/{appointmentId}
     */
    @DeleteMapping("/appointment/{appointmentId}")
    @ApiMessage("Cancel appointment reminders")
    public ResponseEntity<Map<String, String>> cancelAppointmentReminders(
            @PathVariable Long appointmentId) {
        log.info("Request to cancel reminders for appointment ID: {}", appointmentId);
        
        try {
            reminderService.cancelRemindersForAppointment(appointmentId);
            return ResponseEntity.ok(Map.of("message", "Reminders cancelled successfully"));
        } catch (Exception e) {
            log.error("Error cancelling reminders", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get reminder statistics (Admin only)
     * GET /api/reminders/statistics
     */
    @GetMapping("/statistics")
    @ApiMessage("Get reminder statistics")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getReminderStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Request to get reminder statistics from {} to {}", startDate, endDate);
        
        Map<String, Object> stats = reminderService.getReminderStatistics(startDate, endDate);
        return ResponseEntity.ok(stats);
    }
}
