package com.dapp.backend.dto.blockchain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainVaccineRecordDetails {
    private boolean success;
    private VaccineRecordDetailData data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VaccineRecordDetailData {
        private String recordId;
        private String identityHash;
        private String vaccineId;
        private String vaccineName;
        private Integer doseNumber;
        private String vaccinationDate;
        private String lotNumber;
        private String expiryDate;
        private String site;
        private String doctorId;
        private String doctorName;
        private String centerId;
        private String centerName;
        private String appointmentId;
        private String notes;
        private String ipfsHash;
        private String createdAt;
        private boolean isActive;
    }
}
