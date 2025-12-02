package com.dapp.backend.dto.blockchain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainIdentityDetails {
    private boolean success;
    private IdentityData data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IdentityData {
        private String identityHash;
        private String did;
        private String guardian;
        private String idType;
        private String createdAt;
        private boolean isActive;
        private String ipfsDataHash;
    }
}
