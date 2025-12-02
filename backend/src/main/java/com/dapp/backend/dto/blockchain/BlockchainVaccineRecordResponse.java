package com.dapp.backend.dto.blockchain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainVaccineRecordResponse {
    private boolean success;
    private String message;
    private VaccineRecordData data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VaccineRecordData {
        private String recordId;
        private String transactionHash;
        private Long blockNumber;
    }
}
