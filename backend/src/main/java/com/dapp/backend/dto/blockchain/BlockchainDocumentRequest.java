package com.dapp.backend.dto.blockchain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainDocumentRequest {
    private String identityHash;
    private String documentType;
    private String ipfsHash;
    private String guardianAddress;
}
