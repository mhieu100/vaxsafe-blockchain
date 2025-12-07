package com.dapp.backend.controller;

import com.dapp.backend.enums.AppointmentStatus;
import com.dapp.backend.enums.BookingEnum;
import com.dapp.backend.model.*;
import com.dapp.backend.repository.*;
import com.dapp.backend.service.EmailService;
import com.dapp.backend.service.NextDoseReminderService;
import com.dapp.backend.service.VaccinationReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
public class TestReminderController {

    private final AppointmentRepository appointmentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final VaccineRepository vaccineRepository;
    private final CenterRepository centerRepository;
    private final DoctorAvailableSlotRepository doctorAvailableSlotRepository;
    private final VaccinationReminderService reminderService;
    private final NextDoseReminderService nextDoseReminderService;
    private final EmailService emailService;

    /**
     * Test endpoint to create a fake appointment with upcoming date
     * POST /api/test/create-test-appointment?daysFromNow=3&userId=1
     */
    @PostMapping("/create-test-appointment")
    public ResponseEntity<Map<String, Object>> createTestAppointment(
            @RequestParam(defaultValue = "3") int daysFromNow,
            @RequestParam Long userId) {
        
        try {
            log.info("Creating test appointment {} days from now for user ID: {}", daysFromNow, userId);
            
            // Get user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
            
            if (user.getEmail() == null || user.getEmail().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "User does not have an email address",
                    "userId", userId
                ));
            }
            
            // Get any vaccine
            Vaccine vaccine = vaccineRepository.findAll().stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No vaccines found in database"));
            
            // Get any center
            Center center = centerRepository.findAll().stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No vaccination centers found in database"));
            
            // Get any time slot
            DoctorAvailableSlot timeSlot = doctorAvailableSlotRepository.findAll().stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No time slots found in database"));
            
            // Create booking first
            Booking booking = Booking.builder()
                    .patient(user)
                    .vaccine(vaccine)
                    .totalDoses(vaccine.getDosesRequired())
                    .totalAmount((double) vaccine.getPrice())
                    .status(BookingEnum.CONFIRMED)
                    .build();
            
            Booking savedBooking = bookingRepository.save(booking);
            log.info("Created test booking with ID: {}", savedBooking.getBookingId());
            
            // Create appointment
            LocalDate appointmentDate = LocalDate.now().plusDays(daysFromNow);
            
            Appointment appointment = Appointment.builder()
                    .booking(savedBooking)
                    .center(center)
                    .slot(timeSlot)
                    .scheduledDate(appointmentDate)
                    .status(AppointmentStatus.SCHEDULED)
                    .doseNumber(1)
                    .build();
            
            Appointment savedAppointment = appointmentRepository.save(appointment);
            log.info("Created test appointment with ID: {}", savedAppointment.getId());
            
            // Create reminders
            reminderService.createRemindersForAppointment(savedAppointment);
            log.info("Created reminders for test appointment ID: {}", savedAppointment.getId());
            
            // Send confirmation email
            try {
                emailService.sendAppointmentConfirmation(
                    user.getEmail(),
                    user.getFullName(),
                    vaccine.getName(),
                    appointmentDate,
                    timeSlot.getStartTime() + " - " + timeSlot.getEndTime(),
                    center.getName(),
                    savedAppointment.getId()
                );
                log.info("Sent appointment confirmation email to: {}", user.getEmail());
            } catch (Exception e) {
                log.error("Failed to send confirmation email", e);
                // Don't fail appointment creation if email fails
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test appointment created successfully");
            response.put("appointmentId", savedAppointment.getId());
            response.put("appointmentDate", appointmentDate.toString());
            response.put("patientName", user.getFullName());
            response.put("patientEmail", user.getEmail());
            response.put("vaccineName", vaccine.getName());
            response.put("centerName", center.getName());
            response.put("timeSlot", timeSlot.getStartTime() + " - " + timeSlot.getEndTime());
            response.put("remindersCreated", true);
            response.put("reminderDates", new String[]{
                appointmentDate.minusDays(1).toString(),
                appointmentDate.minusDays(3).toString(),
                appointmentDate.minusDays(7).toString()
            });
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error creating test appointment", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Test endpoint to send reminders immediately
     * POST /api/test/send-test-reminder
     */
    @PostMapping("/send-test-reminder")
    public ResponseEntity<Map<String, Object>> sendTestReminder() {
        try {
            log.info("Manually triggering reminder sending for testing");
            reminderService.sendPendingReminders();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test reminders sent successfully. Check your email!");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error sending test reminders", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Test endpoint to complete an appointment and trigger next dose reminder
     * POST /api/test/complete-appointment/{appointmentId}
     */
    @PostMapping("/complete-appointment/{appointmentId}")
    public ResponseEntity<Map<String, Object>> completeTestAppointment(
            @PathVariable Long appointmentId) {
        
        try {
            log.info("Completing test appointment ID: {}", appointmentId);
            
            Appointment appointment = appointmentRepository.findById(appointmentId)
                    .orElseThrow(() -> new RuntimeException("Appointment not found: " + appointmentId));
            
            // Mark as completed
            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointment.setVaccinationDate(LocalDate.now());
            appointmentRepository.save(appointment);
            
            log.info("Appointment {} marked as COMPLETED", appointmentId);
            
            // Create next dose reminder
            nextDoseReminderService.createNextDoseReminder(appointment);
            log.info("Next dose reminder created for appointment {}", appointmentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Appointment completed successfully");
            response.put("appointmentId", appointmentId);
            response.put("completedDate", LocalDate.now().toString());
            response.put("nextDoseReminderCreated", true);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error completing test appointment", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
