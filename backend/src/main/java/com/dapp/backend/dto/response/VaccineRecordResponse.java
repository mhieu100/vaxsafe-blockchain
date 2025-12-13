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

    String patientName;
    String patientIdentityHash;

    Long vaccineId;
    String vaccineName;
    String vaccineSlug;
    Integer dosesRequired;
    Integer doseNumber;

    String manufacturer;

    LocalDate vaccinationDate;
    VaccinationSite site;

    Long doctorId;
    String doctorName;

    Long centerId;
    String centerName;

    Long appointmentId;

    String notes;
    String adverseReactions;
    LocalDateTime followUpDate;

    Double height;
    Double weight;
    Double temperature;
    Integer pulse;
    

    String blockchainRecordId;
    String transactionHash;
    Long blockNumber;
    String ipfsHash;
    String digitalSignature;
    boolean isVerified;
    LocalDateTime verifiedAt;

    LocalDate nextDoseDate;
    Integer nextDoseNumber;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
