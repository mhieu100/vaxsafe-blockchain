package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.dto.mapper.UserMapper;
import com.dapp.backend.dto.response.DoctorAvailableSlotResponse;
import com.dapp.backend.dto.response.DoctorResponse;
import com.dapp.backend.dto.response.DoctorWithScheduleResponse;
import com.dapp.backend.enums.TimeSlotEnum;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Center;
import com.dapp.backend.model.User;
import com.dapp.backend.repository.UserRepository;
import com.dapp.backend.service.DoctorScheduleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@CrossOrigin
public class DoctorScheduleController {

    DoctorScheduleService doctorScheduleService;
    UserRepository userRepository;

    
    @GetMapping("/my-center/with-schedule")
    @ApiMessage("Get all doctors with today's schedule in current user's center")
    public ResponseEntity<List<DoctorWithScheduleResponse>> getDoctorsWithScheduleInMyCenter(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date)
            throws AppException {


        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException("User not found"));

        Center center = UserMapper.getCenter(currentUser);
        if (center == null) {
            throw new AppException("User is not assigned to any center");
        }

        Long centerId = center.getCenterId();
        LocalDate targetDate = date != null ? date : LocalDate.now();

        log.info("Getting doctors with schedule for center {} on {}", centerId, targetDate);

        return ResponseEntity.ok(
                doctorScheduleService.getDoctorsWithTodaySchedule(centerId, targetDate));
    }

    
    @GetMapping("/center/{centerId}/available")
    @ApiMessage("Get all available doctors by center")
    public ResponseEntity<List<DoctorResponse>> getAvailableDoctors(@PathVariable Long centerId) {
        return ResponseEntity.ok(doctorScheduleService.getAvailableDoctorsByCenter(centerId));
    }

    
    @GetMapping("/{doctorId}/slots/available")
    @ApiMessage("Get available slots for a doctor on a specific date")
    public ResponseEntity<List<DoctorAvailableSlotResponse>> getAvailableSlots(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(doctorScheduleService.getAvailableSlots(doctorId, date));
    }

    
    @GetMapping("/center/{centerId}/slots/available")
    @ApiMessage("Get all available slots for a center on a specific date")
    public ResponseEntity<List<DoctorAvailableSlotResponse>> getAvailableSlotsByCenter(
            @PathVariable Long centerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(doctorScheduleService.getAvailableSlotsByCenter(centerId, date));
    }

    
    @GetMapping("/center/{centerId}/slots/available-by-timeslot")
    @ApiMessage("Get all available slots for a center filtered by date and time slot")
    public ResponseEntity<List<DoctorAvailableSlotResponse>> getAvailableSlotsByCenterAndTimeSlot(
            @PathVariable Long centerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam TimeSlotEnum timeSlot) {
        return ResponseEntity.ok(
                doctorScheduleService.getAvailableSlotsByCenterAndTimeSlot(centerId, date, timeSlot));
    }

    
    @GetMapping("/{doctorId}/slots")
    @ApiMessage("Get doctor's slots in a date range (for calendar view)")
    public ResponseEntity<List<DoctorAvailableSlotResponse>> getDoctorSlotsInRange(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) throws AppException {
        return ResponseEntity.ok(doctorScheduleService.getDoctorSlotsInRange(doctorId, startDate, endDate));
    }

    
    @PostMapping("/{doctorId}/slots/generate")
    @ApiMessage("Generate slots for a doctor in a date range")
    public ResponseEntity<Map<String, Object>> generateSlots(
            @PathVariable Long doctorId,
            @RequestBody Map<String, String> request) throws AppException {
        LocalDate startDate = LocalDate.parse(request.get("startDate"));
        LocalDate endDate = LocalDate.parse(request.get("endDate"));

        int slotsGenerated = doctorScheduleService.generateDoctorSlots(doctorId, startDate, endDate);

        return ResponseEntity.ok(Map.of(
                "message", "Slots generated successfully",
                "doctorId", doctorId,
                "slotsGenerated", slotsGenerated,
                "startDate", startDate,
                "endDate", endDate));
    }
}
