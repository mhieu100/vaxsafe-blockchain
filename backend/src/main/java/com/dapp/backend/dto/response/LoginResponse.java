package com.dapp.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoginResponse {
    String accessToken;
    UserLogin user;

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class UserLogin {
        Long id;
        String avatar;
        String fullName;
        String email;
        String phone;
        LocalDate birthday;
        String gender;
        String address;
        String identityNumber;
        String bloodType;
        Double heightCm;
        Double weightKg;
        String occupation;
        String lifestyleNotes;
        String insuranceNumber;
        boolean consentForAIAnalysis;

        String role;
        @JsonProperty("isActive")
        boolean isActive;
        @JsonProperty("isNewUser")
        boolean isNewUser;


        Long centerId;
        String centerName;
    }
}
