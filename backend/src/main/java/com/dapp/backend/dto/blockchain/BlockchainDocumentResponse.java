package com.dapp.backend.dto.blockchain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainDocumentResponse {
    private boolean success;
    private String message;
    private BlockchainIdentityResponse.BlockchainTransactionData data;
}
