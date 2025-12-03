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
     * Backend wallet will be used as guardian automatically
     */
    public BlockchainIdentityResponse createIdentity(
            String identityHash,
            String did,
            IdentityType idType,
            String ipfsDataHash,
            String email
    ) {
        try {
            String url = blockchainServiceUrl + "/identity/create";
            
            BlockchainIdentityRequest request = BlockchainIdentityRequest.builder()
                    .identityHash(identityHash)
                    .did(did)
                    .guardianAddress(null) // Backend wallet will be used
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
                    BlockchainIdentityResponse.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("Identity created on blockchain: {}", identityHash);
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
     * Backend wallet will be used for signing automatically
     */
    public BlockchainDocumentResponse linkDocument(
            String identityHash,
            String documentType,
            String ipfsHash
    ) {
        try {
            String url = blockchainServiceUrl + "/identity/link-document";
            
            BlockchainDocumentRequest request = BlockchainDocumentRequest.builder()
                    .identityHash(identityHash)
                    .documentType(documentType)
                    .ipfsHash(ipfsHash)
                    .guardianAddress(null) // Backend wallet will be used
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<BlockchainDocumentRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<BlockchainDocumentResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    BlockchainDocumentResponse.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("Document linked to identity on blockchain: {}", identityHash);
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
                    BlockchainIdentityDetails.class
            );

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
                    BlockchainVaccineRecordResponse.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("Vaccine record created on blockchain: recordId={}", 
                        response.getBody().getData().getRecordId());
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
                    BlockchainVaccineRecordDetails.class
            );

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
                    BlockchainVaccineRecordList.class
            );

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
}
