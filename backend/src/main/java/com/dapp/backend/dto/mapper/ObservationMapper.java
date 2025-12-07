package com.dapp.backend.dto.mapper;

import com.dapp.backend.dto.request.ObservationRequest;
import com.dapp.backend.dto.response.ObservationResponse;
import com.dapp.backend.model.Observation;
import com.dapp.backend.model.Patient;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ObservationMapper {

    public Observation toEntity(ObservationRequest request, Patient patient) {
        return Observation.builder()
                .type(request.getType())
                .value(request.getValue())
                .unit(request.getUnit())
                .note(request.getNote())
                .recordedAt(LocalDateTime.now()) // Default to now
                .patient(patient)
                // Appointment setting will be handled in service
                .build();
    }

    public ObservationResponse toResponse(Observation observation) {
        return ObservationResponse.builder()
                .id(observation.getId())
                .patientId(observation.getPatient().getId())
                .type(observation.getType())
                .value(observation.getValue())
                .unit(observation.getUnit())
                .note(observation.getNote())
                .recordedAt(observation.getRecordedAt())
                .build();
    }
}
