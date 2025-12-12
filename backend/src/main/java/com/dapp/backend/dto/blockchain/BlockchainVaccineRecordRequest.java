package com.dapp.backend.dto.blockchain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainVaccineRecordRequest {
    private String identityHash;
    private String vaccineId;
    private String vaccineName;
    private Integer doseNumber;
    private String vaccinationDate;

    private String site;
    private String doctorId;
    private String doctorName;
    private String centerId;
    private String centerName;
    private String appointmentId;
    private String notes;
    private String ipfsHash;
}
