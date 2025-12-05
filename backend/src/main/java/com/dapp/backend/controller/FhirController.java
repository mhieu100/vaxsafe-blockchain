package com.dapp.backend.controller;

import ca.uhn.fhir.context.FhirContext;
import com.dapp.backend.dto.mapper.fhir.FhirPatientMapper;
import com.dapp.backend.model.User;
import com.dapp.backend.model.VaccineRecord;
import com.dapp.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Immunization;
import org.hl7.fhir.r4.model.Patient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/fhir")
@RequiredArgsConstructor
public class FhirController {

    private final FhirPatientMapper fhirPatientMapper;
    private final com.dapp.backend.dto.mapper.fhir.FhirImmunizationMapper fhirImmunizationMapper;
    private final UserRepository userRepository;
    private final com.dapp.backend.repository.VaccineRecordRepository vaccineRecordRepository;

    // Create a single context instance (expensive to create, so keep it as a field)
    private final FhirContext fhirContext = FhirContext.forR4();

    @GetMapping(value = "/Patient/{id}", produces = "application/json")
    public ResponseEntity<String> getPatient(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get patient profile if exists
        com.dapp.backend.model.Patient patientProfile = user.getPatientProfile();

        // Map to FHIR Patient
        Patient fhirPatient = fhirPatientMapper.toFhirPatient(user, patientProfile);

        // Serialize to JSON using HAPI FHIR Parser
        String json = fhirContext.newJsonParser().setPrettyPrint(true).encodeResourceToString(fhirPatient);

        return ResponseEntity.ok(json);
    }

    @GetMapping(value = "/Immunization", produces = "application/json")
    public ResponseEntity<String> getImmunizations(
            @RequestParam(name = "patient") Long patientId) {
        List<VaccineRecord> records = vaccineRecordRepository
                .findByUserIdOrderByVaccinationDateDesc(patientId);

        // Create a Bundle to hold multiple Immunization resources
        Bundle bundle = new Bundle();
        bundle.setType(Bundle.BundleType.SEARCHSET);

        for (VaccineRecord record : records) {
            Immunization immunization = fhirImmunizationMapper.toFhirImmunization(record);
            bundle.addEntry().setResource(immunization);
        }

        String json = fhirContext.newJsonParser().setPrettyPrint(true).encodeResourceToString(bundle);
        return ResponseEntity.ok(json);
    }
}
