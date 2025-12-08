package com.dapp.backend.dto.request;

import com.dapp.backend.enums.BloodType;
import com.dapp.backend.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class UpdateProfileRequest {

    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientProfileUpdate {

        private String fullName;

        @Pattern(regexp = "^[0-9]{9,11}$", message = "Phone must be 9-11 digits")
        private String phone;

        private Gender gender;

        private String address;


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

    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorProfileUpdate {

        @NotBlank(message = "Full name is required")
        private String fullName;

        @Pattern(regexp = "^[0-9]{9,11}$", message = "Phone must be 9-11 digits")
        private String phone;

        private Gender gender;

        private String address;


        private String specialization;
        private Integer consultationDuration;
        private Integer maxPatientsPerDay;
    }

    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CashierProfileUpdate {

        @NotBlank(message = "Full name is required")
        private String fullName;

        @Pattern(regexp = "^[0-9]{9,11}$", message = "Phone must be 9-11 digits")
        private String phone;

        private Gender gender;

        private String address;


        private String shiftStartTime;
        private String shiftEndTime;
    }

    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminProfileUpdate {

        @NotBlank(message = "Full name is required")
        private String fullName;

        @Pattern(regexp = "^[0-9]{9,11}$", message = "Phone must be 9-11 digits")
        private String phone;

        private Gender gender;

        private String address;
    }
}
