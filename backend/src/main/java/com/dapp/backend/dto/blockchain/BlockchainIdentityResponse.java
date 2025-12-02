package com.dapp.backend.dto.blockchain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainIdentityResponse {
    private boolean success;
    private String message;
    private BlockchainTransactionData data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BlockchainTransactionData {
        private String transactionHash;
        private Long blockNumber;
    }
}
