package com.dapp.backend.dto.request;

import com.dapp.backend.enums.BloodType;
import com.dapp.backend.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class UpdateProfileRequest {

    /**
     * Update request for PATIENT role
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientProfileUpdate {
        // Common user fields
        private String fullName;

        @Pattern(regexp = "^[0-9]{9,11}$", message = "Phone must be 9-11 digits")
        private String phone;

        private Gender gender;

        private String address;

        // Patient specific fields
        private BloodType bloodType;

        @Positive(message = "Height must be positive")
        private Double heightCm;

        @Positive(message = "Weight must be positive")
        private Double weightKg;

        private String occupation;
        private String lifestyleNotes;
        private String insuranceNumber;
        private Boolean consentForAIAnalysis;
    }

    /**
     * Update request for DOCTOR role
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorProfileUpdate {
        // Common user fields
        @NotBlank(message = "Full name is required")
        private String fullName;

        @Pattern(regexp = "^[0-9]{9,11}$", message = "Phone must be 9-11 digits")
        private String phone;

        private Gender gender;

        private String address;

        // Doctor specific fields (usually not editable by doctor themselves)
        private String specialization;
        private Integer consultationDuration;
        private Integer maxPatientsPerDay;
    }

    /**
     * Update request for CASHIER role
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CashierProfileUpdate {
        // Common user fields
        @NotBlank(message = "Full name is required")
        private String fullName;

        @Pattern(regexp = "^[0-9]{9,11}$", message = "Phone must be 9-11 digits")
        private String phone;

        private Gender gender;

        private String address;

        // Cashier specific fields (shift times - usually not editable by cashier)
        private String shiftStartTime;
        private String shiftEndTime;
    }

    /**
     * Update request for ADMIN role
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminProfileUpdate {
        // Common user fields only
        @NotBlank(message = "Full name is required")
        private String fullName;

        @Pattern(regexp = "^[0-9]{9,11}$", message = "Phone must be 9-11 digits")
        private String phone;

        private Gender gender;

        private String address;
    }
}
