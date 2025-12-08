package com.dapp.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    Long id;
    String avatar;
    String fullName;
    String email;


    RoleInfo role;


    PatientInfo patientProfile;


    CenterInfo center;

    boolean isDeleted;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class RoleInfo {
        Long id;
        String name;
        List<PermissionInfo> permissions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class PermissionInfo {
        Long id;
        String name;
        String apiPath;
        String method;
        String module;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class PatientInfo {
        Long id;
        String address;
        String phone;
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

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CenterInfo {
        Long centerId;
        String name;
        String image;
        String address;
        String phoneNumber;
        Integer capacity;
        String workingHours;
    }
}
