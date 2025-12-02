package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.dto.request.UpdateProfileRequest;
import com.dapp.backend.dto.response.ProfileResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {
    
    private final ProfileService profileService;

    /**
     * Get profile for PATIENT role
     * Returns: User info + Patient specific fields
     */
    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    @ApiMessage("Get patient profile successfully")
    public ResponseEntity<ProfileResponse.PatientProfile> getPatientProfile() throws AppException {
        return ResponseEntity.ok(profileService.getPatientProfile());
    }

    /**
     * Update profile for PATIENT role
     */
    @PutMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    @ApiMessage("Update patient profile successfully")
    public ResponseEntity<ProfileResponse.PatientProfile> updatePatientProfile(
            @Valid @RequestBody UpdateProfileRequest.PatientProfileUpdate request) throws AppException {
        return ResponseEntity.ok(profileService.updatePatientProfile(request));
    }

    /**
     * Get profile for DOCTOR role
     * Returns: User info + Doctor specific fields
     */
    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    @ApiMessage("Get doctor profile successfully")
    public ResponseEntity<ProfileResponse.DoctorProfile> getDoctorProfile() throws AppException {
        return ResponseEntity.ok(profileService.getDoctorProfile());
    }

    /**
     * Update profile for DOCTOR role
     */
    @PutMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    @ApiMessage("Update doctor profile successfully")
    public ResponseEntity<ProfileResponse.DoctorProfile> updateDoctorProfile(
            @Valid @RequestBody UpdateProfileRequest.DoctorProfileUpdate request) throws AppException {
        return ResponseEntity.ok(profileService.updateDoctorProfile(request));
    }

    /**
     * Get profile for CASHIER role
     * Returns: User info + Cashier specific fields
     */
    @GetMapping("/cashier")
    @PreAuthorize("hasRole('CASHIER')")
    @ApiMessage("Get cashier profile successfully")
    public ResponseEntity<ProfileResponse.CashierProfile> getCashierProfile() throws AppException {
        return ResponseEntity.ok(profileService.getCashierProfile());
    }

    /**
     * Update profile for CASHIER role
     */
    @PutMapping("/cashier")
    @PreAuthorize("hasRole('CASHIER')")
    @ApiMessage("Update cashier profile successfully")
    public ResponseEntity<ProfileResponse.CashierProfile> updateCashierProfile(
            @Valid @RequestBody UpdateProfileRequest.CashierProfileUpdate request) throws AppException {
        return ResponseEntity.ok(profileService.updateCashierProfile(request));
    }

    /**
     * Get profile for ADMIN role
     * Returns: User info only (admin has no specific profile)
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @ApiMessage("Get admin profile successfully")
    public ResponseEntity<ProfileResponse.AdminProfile> getAdminProfile() throws AppException {
        return ResponseEntity.ok(profileService.getAdminProfile());
    }

    /**
     * Update profile for ADMIN role
     */
    @PutMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @ApiMessage("Update admin profile successfully")
    public ResponseEntity<ProfileResponse.AdminProfile> updateAdminProfile(
            @Valid @RequestBody UpdateProfileRequest.AdminProfileUpdate request) throws AppException {
        return ResponseEntity.ok(profileService.updateAdminProfile(request));
    }
}
