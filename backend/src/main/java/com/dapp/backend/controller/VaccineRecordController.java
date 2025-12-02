package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.dto.response.VaccineRecordResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.service.VaccineRecordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vaccine-records")
@RequiredArgsConstructor
@Slf4j
public class VaccineRecordController {

    private final VaccineRecordService vaccineRecordService;

    /**
     * Get all vaccine records for a patient (includes their own records and family members' records)
     * GET /api/vaccine-records/patient/{userId}
     */
    @GetMapping("/patient/{userId}")
    @ApiMessage("Get all vaccine records for patient")
    public ResponseEntity<List<VaccineRecordResponse>> getVaccineRecordsByPatient(
            @PathVariable Long userId) throws AppException {
        log.info("Request to get vaccine records for patient ID: {}", userId);
        
        List<VaccineRecordResponse> records = vaccineRecordService.getAllVaccineRecordsByPatient(userId);
        
        log.info("Returning {} vaccine records for patient ID: {}", records.size(), userId);
        return ResponseEntity.ok(records);
    }
}
