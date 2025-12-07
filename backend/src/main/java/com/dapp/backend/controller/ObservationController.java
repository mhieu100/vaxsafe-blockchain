package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.dto.request.ObservationRequest;
import com.dapp.backend.dto.response.ObservationResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.service.ObservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/observations")
@RequiredArgsConstructor
public class ObservationController {

    private final ObservationService observationService;

    @PostMapping
    @ApiMessage("Create new observation")
    public ResponseEntity<ObservationResponse> createObservation(@Valid @RequestBody ObservationRequest request)
            throws AppException {
        return ResponseEntity.ok(observationService.createObservation(request));
    }

    @GetMapping("/me")
    @ApiMessage("Get my observations")
    public ResponseEntity<List<ObservationResponse>> getMyObservations() throws AppException {
        return ResponseEntity.ok(observationService.getMyObservations());
    }

    @PostMapping("/patient/{patientId}")
    @ApiMessage("Create observation for patient (Doctor/Staff)")
    public ResponseEntity<ObservationResponse> createObservationForPatient(
            @PathVariable Long patientId,
            @Valid @RequestBody ObservationRequest request) throws AppException {
        return ResponseEntity.ok(observationService.createObservationForPatient(patientId, request));
    }
}
