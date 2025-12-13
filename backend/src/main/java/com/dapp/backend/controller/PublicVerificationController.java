package com.dapp.backend.controller;

import com.dapp.backend.dto.response.VaccineRecordResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.service.VaccineRecordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@Slf4j
public class PublicVerificationController {

    private final VaccineRecordService vaccineRecordService;

    @GetMapping("/verify-vaccine/{ipfsHash}")
    public ResponseEntity<VaccineRecordResponse> verifyVaccineRecord(@PathVariable String ipfsHash)
            throws AppException {
        log.info("Public verification request for IPFS Hash: {}", ipfsHash);
        return ResponseEntity.ok(vaccineRecordService.getRecordByIpfsHash(ipfsHash));
    }
}
