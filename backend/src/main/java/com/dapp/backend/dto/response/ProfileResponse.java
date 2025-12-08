package com.dapp.backend.dto.response;

import com.dapp.backend.enums.BloodType;
import com.dapp.backend.enums.Gender;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

public class ProfileResponse {

    
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

    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientProfile {

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

    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorProfile {

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


        private Long doctorId;
        private String licenseNumber;
        private String specialization;
        private Integer consultationDuration;
        private Integer maxPatientsPerDay;
        private Boolean isAvailable;


        private Long centerId;
        private String centerName;
        private String centerAddress;
    }

    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CashierProfile {

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


        private Long cashierId;
        private String employeeCode;
        private String shiftStartTime;
        private String shiftEndTime;
        private Boolean isActive;


        private Long centerId;
        private String centerName;
        private String centerAddress;
    }

    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminProfile {

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
