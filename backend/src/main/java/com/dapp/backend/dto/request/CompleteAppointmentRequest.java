package com.dapp.backend.dto.request;

import com.dapp.backend.enums.VaccinationSite;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CompleteAppointmentRequest {
    // Vaccine Info
    String lotNumber;
    LocalDate expiryDate;
    VaccinationSite site;
    String notes;

    // Vitals
    Double height; // cm
    Double weight; // kg
    Double temperature; // Celsius
    Integer pulse; // bpm
    Integer systolic; // mmHg
    Integer diastolic; // mmHg

    // Adverse reactions (if immediately observed)
    String adverseReactions;
}
