package com.dapp.backend.dto.blockchain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainIdentityRequest {
    private String identityHash;
    private String did;
    private String idType;
    private String ipfsDataHash;
    private String email;
}
