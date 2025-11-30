package com.dapp.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RegisterPatientResponse {

    long id;
    String avatar;
    String fullName;
    String email;
    String role;
    boolean isActive; // Account activation status

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class PatientProfileResponse {
        long id;
        String address;
        String phone;

        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate birthday;

        String gender;
        String identityNumber;
        String bloodType;
        Double heightCm;
        Double weightKg;
        String occupation;
        String lifestyleNotes;
        String insuranceNumber;
        boolean consentForAIAnalysis;
    }
}
