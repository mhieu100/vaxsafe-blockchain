package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.dto.request.AvatarRequest;
import com.dapp.backend.dto.request.UpdateProfileRequest;
import com.dapp.backend.dto.response.ProfileResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    
    @PutMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    @ApiMessage("Update patient profile successfully")
    public ResponseEntity<ProfileResponse.PatientProfile> updatePatientProfile(
            @Valid @RequestBody UpdateProfileRequest.PatientProfileUpdate request) throws AppException {
        log.info("📝 Received update patient profile request: {}", request);
        return ResponseEntity.ok(profileService.updatePatientProfile(request));
    }

    
    @PutMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    @ApiMessage("Update doctor profile successfully")
    public ResponseEntity<ProfileResponse.DoctorProfile> updateDoctorProfile(
            @Valid @RequestBody UpdateProfileRequest.DoctorProfileUpdate request) throws AppException {
        log.info("📝 Received update doctor profile request: {}", request);
        return ResponseEntity.ok(profileService.updateDoctorProfile(request));
    }

    
    @PutMapping("/cashier")
    @PreAuthorize("hasRole('CASHIER')")
    @ApiMessage("Update cashier profile successfully")
    public ResponseEntity<ProfileResponse.CashierProfile> updateCashierProfile(
            @Valid @RequestBody UpdateProfileRequest.CashierProfileUpdate request) throws AppException {
        log.info("📝 Received update cashier profile request: {}", request);
        return ResponseEntity.ok(profileService.updateCashierProfile(request));
    }

    
    @PutMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @ApiMessage("Update admin profile successfully")
    public ResponseEntity<ProfileResponse.AdminProfile> updateAdminProfile(
            @Valid @RequestBody UpdateProfileRequest.AdminProfileUpdate request) throws AppException {
        log.info("📝 Received update admin profile request: {}", request);
        return ResponseEntity.ok(profileService.updateAdminProfile(request));
    }

    @PutMapping("/avatar")
    @ApiMessage("Update avatar successfully")
    public ResponseEntity<String> updateAvatar(@RequestBody AvatarRequest request)
            throws AppException {
        return ResponseEntity.ok(profileService.updateAvatar(request.getAvatarUrl()));
    }
}
