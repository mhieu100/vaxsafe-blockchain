package com.dapp.backend.service;

import com.dapp.backend.dto.blockchain.*;
import com.dapp.backend.enums.IdentityType;
import com.dapp.backend.model.VaccineRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlockchainService {

    private final RestTemplate restTemplate;

    @Value("${blockchain.service.url}")
    private String blockchainServiceUrl;

    /**
     * Create identity on blockchain
     * 
     * Guardian address is automatically set to accounts[0] by blockchain-service.
     * This is a simplified approach for MVP:
     * - All identities (users and family members) have the same guardian on-chain
     * - Parent-child relationship exists only in database, not on blockchain
     * - Suitable for use cases where backend acts as trusted guardian
     * 
     * Future considerations:
     * - Option 1: Keep simplified (backend as universal guardian) - easier
     * - Option 2: Create wallets for each parent, pass real guardian address -
     * complex
     * - Option 3: Multi-sig guardian with backend + parent - most secure
     */
    public BlockchainIdentityResponse createIdentity(
            String identityHash,
            String did,
            IdentityType idType,
            String ipfsDataHash,
            String email) {
        try {
            String url = blockchainServiceUrl + "/identity/create";

            BlockchainIdentityRequest request = BlockchainIdentityRequest.builder()
                    .identityHash(identityHash)
                    .did(did)
                    .idType(idType.name())
                    .ipfsDataHash(ipfsDataHash != null ? ipfsDataHash : "")
                    .email(email) // For logging
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<BlockchainIdentityRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<BlockchainIdentityResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    BlockchainIdentityResponse.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                var txHash = response.getBody().getData() != null ? response.getBody().getData().getTransactionHash()
                        : "N/A";
                log.info("\n" +
                        "╔═══════════════════════════════════════════════════════════════════╗\n" +
                        "║           🔗 BLOCKCHAIN SERVICE - IDENTITY CREATED                ║\n" +
                        "╠═══════════════════════════════════════════════════════════════════╣\n" +
                        "║  🆔 Identity Hash: {}\n" +
                        "║  📧 Email: {}\n" +
                        "║  🏷️  Type: {}\n" +
                        "║  📜 TxHash: {}\n" +
                        "╚═══════════════════════════════════════════════════════════════════╝",
                        identityHash, email, idType, txHash);
                return response.getBody();
            } else {
                log.error("Failed to create identity on blockchain: {}", response.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            log.error("Error creating identity on blockchain", e);
            return null;
        }
    }

    /**
     * Link document to identity on blockchain
     * Transaction sender is automatically set to accounts[0] by blockchain-service
     */
    public BlockchainDocumentResponse linkDocument(
            String identityHash,
            String documentType,
            String ipfsHash) {
        try {
            String url = blockchainServiceUrl + "/identity/link-document";

            BlockchainDocumentRequest request = BlockchainDocumentRequest.builder()
                    .identityHash(identityHash)
                    .documentType(documentType)
                    .ipfsHash(ipfsHash)
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<BlockchainDocumentRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<BlockchainDocumentResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    BlockchainDocumentResponse.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                var txHash = response.getBody().getData() != null ? response.getBody().getData().getTransactionHash()
                        : "N/A";
                log.info("\n" +
                        "╔═══════════════════════════════════════════════════════════════════╗\n" +
                        "║           📎 DOCUMENT LINKED TO BLOCKCHAIN                        ║\n" +
                        "╠═══════════════════════════════════════════════════════════════════╣\n" +
                        "║  🆔 Identity Hash: {}\n" +
                        "║  📄 Document Type: {}\n" +
                        "║  🗂️  IPFS Hash: {}\n" +
                        "║  📜 TxHash: {}\n" +
                        "╚═══════════════════════════════════════════════════════════════════╝",
                        identityHash, documentType, ipfsHash, txHash);
                return response.getBody();
            } else {
                log.error("Failed to link document on blockchain: {}", response.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            log.error("Error linking document on blockchain", e);
            return null;
        }
    }

    /**
     * Get identity from blockchain
     */
    public BlockchainIdentityDetails getIdentity(String identityHash) {
        try {
            String url = blockchainServiceUrl + "/identity/" + identityHash;

            ResponseEntity<BlockchainIdentityDetails> response = restTemplate.getForEntity(
                    url,
                    BlockchainIdentityDetails.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                log.error("Failed to get identity from blockchain: {}", response.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            log.error("Error getting identity from blockchain", e);
            return null;
        }
    }

    /**
     * Create vaccine record on blockchain
     */
    public BlockchainVaccineRecordResponse createVaccineRecord(VaccineRecord record) {
        try {
            String url = blockchainServiceUrl + "/vaccine-records/create";

            BlockchainVaccineRecordRequest request = BlockchainVaccineRecordRequest.builder()
                    .identityHash(record.getPatientIdentityHash())
                    .vaccineId(String.valueOf(record.getVaccine().getId()))
                    .vaccineName(record.getVaccine().getName())
                    .doseNumber(record.getDoseNumber())
                    .vaccinationDate(record.getVaccinationDate().toString())
                    .lotNumber(record.getLotNumber() != null ? record.getLotNumber() : "")
                    .expiryDate(record.getExpiryDate() != null ? record.getExpiryDate().toString() : "")
                    .site(record.getSite() != null ? record.getSite().name() : "LEFT_ARM")
                    .doctorId(record.getDoctor().getId().toString())
                    .doctorName(record.getDoctor().getFullName())
                    .centerId(record.getCenter().getCenterId().toString())
                    .centerName(record.getCenter().getName())
                    .appointmentId(record.getAppointment().getId().toString())
                    .notes(record.getNotes() != null ? record.getNotes() : "")
                    .ipfsHash(record.getIpfsHash() != null ? record.getIpfsHash() : "")
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<BlockchainVaccineRecordRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<BlockchainVaccineRecordResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    BlockchainVaccineRecordResponse.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                var data = response.getBody().getData();
                log.info("\n" +
                        "╔═══════════════════════════════════════════════════════════════════╗\n" +
                        "║           💉 VACCINE RECORD ON BLOCKCHAIN                         ║\n" +
                        "╠═══════════════════════════════════════════════════════════════════╣\n" +
                        "║  📋 Record ID: {}\n" +
                        "║  🆔 Identity: {}\n" +
                        "║  💊 Vaccine: {} (Dose #{})\n" +
                        "║  🏥 Center: {}\n" +
                        "║  👨‍⚕️ Doctor: {}\n" +
                        "║  📜 TxHash: {}\n" +
                        "╚═══════════════════════════════════════════════════════════════════╝",
                        data.getRecordId(), record.getPatientIdentityHash(),
                        record.getVaccine().getName(), record.getDoseNumber(),
                        record.getCenter().getName(), record.getDoctor().getFullName(),
                        data.getTransactionHash());
                return response.getBody();
            } else {
                log.error("Failed to create vaccine record on blockchain: {}", response.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            log.error("Error creating vaccine record on blockchain", e);
            return null;
        }
    }

    /**
     * Get vaccine record from blockchain
     */
    public BlockchainVaccineRecordDetails getVaccineRecord(Long recordId) {
        try {
            String url = blockchainServiceUrl + "/vaccine-records/" + recordId;

            ResponseEntity<BlockchainVaccineRecordDetails> response = restTemplate.getForEntity(
                    url,
                    BlockchainVaccineRecordDetails.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                log.error("Failed to get vaccine record from blockchain: {}", response.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            log.error("Error getting vaccine record from blockchain", e);
            return null;
        }
    }

    /**
     * Get all vaccine records for an identity from blockchain
     */
    public BlockchainVaccineRecordList getVaccineRecordsByIdentity(String identityHash) {
        try {
            String url = blockchainServiceUrl + "/vaccine-records/identity/" + identityHash;

            ResponseEntity<BlockchainVaccineRecordList> response = restTemplate.getForEntity(
                    url,
                    BlockchainVaccineRecordList.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                log.error("Failed to get vaccine records from blockchain: {}", response.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            log.error("Error getting vaccine records from blockchain", e);
            return null;
        }
    }

    /**
     * Check blockchain service status
     */
    public boolean isBlockchainServiceAvailable() {
        try {
            String url = blockchainServiceUrl + "/ganache/status";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.warn("Blockchain service not available: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Upload JSON to IPFS via Blockchain Service
     */
    public String uploadToIpfs(String jsonContent) {
        try {
            String url = blockchainServiceUrl + "/ipfs/upload";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(jsonContent, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                // Parse response to get IPFS hash
                // Response format: { success: true, data: { ipfsHash: "...", url: "..." } }
                com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper()
                        .readTree(response.getBody());
                if (root.has("success") && root.get("success").asBoolean()) {
                    String ipfsHash = root.get("data").get("ipfsHash").asText();
                    log.info("Uploaded to IPFS: {}", ipfsHash);
                    return ipfsHash;
                }
            }

            log.error("Failed to upload to IPFS: {}", response.getBody());
            return null;
        } catch (Exception e) {
            log.error("Error uploading to IPFS", e);
            return null;
        }
    }
}
