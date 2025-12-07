package com.dapp.backend.service;

import com.dapp.backend.dto.mapper.ObservationMapper;
import com.dapp.backend.dto.request.ObservationRequest;
import com.dapp.backend.dto.response.ObservationResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.Observation;
import com.dapp.backend.model.Patient;
import com.dapp.backend.model.User;
import com.dapp.backend.repository.AppointmentRepository;
import com.dapp.backend.repository.ObservationRepository;
import com.dapp.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ObservationService {

    private final ObservationRepository observationRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final ObservationMapper observationMapper;
    private final AuthService authService;

    @Transactional
    public ObservationResponse createObservation(ObservationRequest request) throws AppException {
        User currentUser = authService.getCurrentUserLogin();

        Patient patient = currentUser.getPatientProfile();
        if (patient == null) {
            throw new AppException("Current user is not a patient");
        }

        Observation observation = observationMapper.toEntity(request, patient);
        observation = observationRepository.save(observation);

        updatePatientVitals(patient, observation);

        return observationMapper.toResponse(observation);
    }

    @Transactional(readOnly = true)
    public List<ObservationResponse> getMyObservations() throws AppException {
        User currentUser = authService.getCurrentUserLogin();
        Patient patient = currentUser.getPatientProfile();

        if (patient == null) {
            throw new AppException("Current user is not a patient");
        }

        return observationRepository.findByPatientIdOrderByRecordedAtDesc(patient.getId())
                .stream()
                .map(observationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ObservationResponse createObservationForPatient(Long patientId, ObservationRequest request)
            throws AppException {
        // Verify current user is allowed (e.g. Doctor or Staff)
        // For now, we assume the controller checks the role via PreAuthorize or
        // similar,
        // or we check here if the user has a doctor/staff profile.
        User currentUser = authService.getCurrentUserLogin();
        if (currentUser.getDoctor() == null && currentUser.getCashier() == null
                && currentUser.getRole().getName().equals("USER")) {
            // Basic check: if normal user, they can't create for others (unless they are
            // guardian, but let's stick to doctor context)
            throw new AppException("Access denied: Only medical staff can perform this action");
        }

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new AppException("Patient not found"));

        Observation observation = observationMapper.toEntity(request, patient);

        if (request.getAppointmentId() != null) {
            Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                    .orElse(null); // Optional: or throw exception if strict
            if (appointment != null) {
                observation.setAppointment(appointment);
            }
        }

        observation = observationRepository.save(observation);

        updatePatientVitals(patient, observation);

        return observationMapper.toResponse(observation);
    }

    private void updatePatientVitals(Patient patient, Observation observation) {
        try {
            if (observation.getType() == com.dapp.backend.enums.ObservationType.BODY_WEIGHT) {
                patient.setWeightKg(Double.parseDouble(observation.getValue()));
                patientRepository.save(patient);
            } else if (observation.getType() == com.dapp.backend.enums.ObservationType.BODY_HEIGHT) {
                patient.setHeightCm(Double.parseDouble(observation.getValue()));
                patientRepository.save(patient);
            }
        } catch (NumberFormatException e) {
            // Log error or ignore if value is not a number
            // In a real system, we'd want better validation before this point
        }
    }
}
