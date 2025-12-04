package com.dapp.backend.dto.response;

import com.dapp.backend.enums.BloodType;
import com.dapp.backend.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;

public class ProfileResponse {

    /**
     * Common user fields for all profiles
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BaseProfile {
        private Long id;
        private String avatar;
        private String fullName;
        private String email;
        private String phone;
        private Gender gender;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate birthday;
        private String address;
        private String role;
    }

    /**
     * Patient profile response
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientProfile {
        // Common user fields
        private Long id;
        private String avatar;
        private String fullName;
        private String email;
        private String phone;
        private Gender gender;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate birthday;
        private String address;
        private String role;

        // Patient specific fields
        private Long patientId;
        private String identityNumber;
        private BloodType bloodType;
        private Double heightCm;
        private Double weightKg;
        private String occupation;
        private String lifestyleNotes;
        private String insuranceNumber;
        private boolean consentForAIAnalysis;
    }

    /**
     * Doctor profile response
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorProfile {
        // Common user fields
        private Long id;
        private String avatar;
        private String fullName;
        private String email;
        private String phone;
        private Gender gender;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate birthday;
        private String address;
        private String role;

        // Doctor specific fields
        private Long doctorId;
        private String licenseNumber;
        private String specialization;
        private Integer consultationDuration;
        private Integer maxPatientsPerDay;
        private Boolean isAvailable;

        // Center info
        private Long centerId;
        private String centerName;
        private String centerAddress;
    }

    /**
     * Cashier profile response
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CashierProfile {
        // Common user fields
        private Long id;
        private String avatar;
        private String fullName;
        private String email;
        private String phone;
        private Gender gender;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate birthday;
        private String address;
        private String role;

        // Cashier specific fields
        private Long cashierId;
        private String employeeCode;
        private String shiftStartTime;
        private String shiftEndTime;
        private Boolean isActive;

        // Center info
        private Long centerId;
        private String centerName;
        private String centerAddress;
    }

    /**
     * Admin profile response
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminProfile {
        // Common user fields only
        private Long id;
        private String avatar;
        private String fullName;
        private String email;
        private String phone;
        private Gender gender;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate birthday;
        private String address;
        private String role;
    }
}
