package com.dapp.backend.dto.response;

import com.dapp.backend.enums.VaccinationSite;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VaccineRecordResponse {

    Long id;

    // Patient Information
    String patientName;
    String patientIdentityHash;

    // Vaccine Information
    Long vaccineId;
    String vaccineName;
    String vaccineSlug;
    Integer doseNumber;
    String lotNumber;
    LocalDate expiryDate;
    String manufacturer;

    // Vaccination Details
    LocalDate vaccinationDate;
    VaccinationSite site;

    // Doctor Information
    Long doctorId;
    String doctorName;

    // Center Information
    Long centerId;
    String centerName;

    // Appointment
    Long appointmentId;

    // Medical Information
    String notes;
    String adverseReactions;
    LocalDateTime followUpDate;

    // Vitals
    Double height;
    Double weight;
    Double temperature;
    Integer pulse;
    Integer systolic;
    Integer diastolic;

    // Blockchain Information
    String blockchainRecordId;
    String transactionHash;
    Long blockNumber;
    String ipfsHash;
    String digitalSignature;
    boolean isVerified;
    LocalDateTime verifiedAt;

    // Next Dose Information
    LocalDate nextDoseDate;
    Integer nextDoseNumber;

    // Timestamps
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
