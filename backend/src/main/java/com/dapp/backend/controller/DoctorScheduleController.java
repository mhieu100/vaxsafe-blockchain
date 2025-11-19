package com.dapp.backend.controller;

import com.dapp.backend.dto.response.DoctorAvailableSlotResponse;
import com.dapp.backend.dto.response.DoctorResponse;
import com.dapp.backend.dto.response.DoctorScheduleResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.service.DoctorScheduleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@CrossOrigin
public class DoctorScheduleController {

    DoctorScheduleService doctorScheduleService;

    /**
     * Get all available doctors by center
     * GET /api/v1/doctors/center/{centerId}/available
     */
    @GetMapping("/center/{centerId}/available")
    public ResponseEntity<List<DoctorResponse>> getAvailableDoctors(@PathVariable Long centerId) {
        return ResponseEntity.ok(doctorScheduleService.getAvailableDoctorsByCenter(centerId));
    }

    /**
     * Get doctor's weekly schedule template
     * GET /api/v1/doctors/{doctorId}/schedules
     */
    @GetMapping("/{doctorId}/schedules")
    public ResponseEntity<List<DoctorScheduleResponse>> getDoctorSchedules(@PathVariable Long doctorId) {
        return ResponseEntity.ok(doctorScheduleService.getDoctorSchedules(doctorId));
    }

    /**
     * Get available slots for a doctor on a specific date
     * GET /api/v1/doctors/{doctorId}/slots/available?date=2025-11-20
     */
    @GetMapping("/{doctorId}/slots/available")
    public ResponseEntity<List<DoctorAvailableSlotResponse>> getAvailableSlots(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(doctorScheduleService.getAvailableSlots(doctorId, date));
    }

    /**
     * Get all available slots for a center on a specific date
     * GET /api/v1/doctors/center/{centerId}/slots/available?date=2025-11-20
     */
    @GetMapping("/center/{centerId}/slots/available")
    public ResponseEntity<List<DoctorAvailableSlotResponse>> getAvailableSlotsByCenter(
            @PathVariable Long centerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(doctorScheduleService.getAvailableSlotsByCenter(centerId, date));
    }

    /**
     * Get doctor's slots in a date range (for calendar view)
     * GET /api/v1/doctors/{doctorId}/slots?startDate=2025-11-01&endDate=2025-11-30
     */
    @GetMapping("/{doctorId}/slots")
    public ResponseEntity<List<DoctorAvailableSlotResponse>> getDoctorSlotsInRange(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(doctorScheduleService.getDoctorSlotsInRange(doctorId, startDate, endDate));
    }

    /**
     * Generate slots for a doctor in a date range
     * POST /api/v1/doctors/{doctorId}/slots/generate
     * Body: { "startDate": "2025-11-01", "endDate": "2025-11-30" }
     */
    @PostMapping("/{doctorId}/slots/generate")
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
            "endDate", endDate
        ));
    }
}
