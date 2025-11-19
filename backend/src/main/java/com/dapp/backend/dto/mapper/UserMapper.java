package com.dapp.backend.dto.mapper;

import com.dapp.backend.dto.response.DoctorResponse;
import com.dapp.backend.dto.response.UserResponse;
import com.dapp.backend.model.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class UserMapper {

    /**
     * Convert User entity to comprehensive UserResponse with all details
     */
    public static UserResponse toUserResponse(User user) {
        if (user == null) {
            return null;
        }

        return UserResponse.builder()
                .id(user.getId())
                .avatar(user.getAvatar())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .walletAddress(user.getWalletAddress())
                .role(mapRole(user.getRole()))
                .patientProfile(mapPatientProfile(user.getPatientProfile()))
                .center(mapCenter(user.getCenter()))
                .isDeleted(user.isDeleted())
                .build();
    }

    /**
     * Map Role entity to RoleInfo DTO with permissions
     */
    private static UserResponse.RoleInfo mapRole(Role role) {
        if (role == null) {
            return null;
        }

        List<UserResponse.PermissionInfo> permissions = role.getPermissions() != null
                ? role.getPermissions().stream()
                        .map(UserMapper::mapPermission)
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return UserResponse.RoleInfo.builder()
                .id(role.getId())
                .name(role.getName())
                .permissions(permissions)
                .build();
    }

    /**
     * Map Permission entity to PermissionInfo DTO
     */
    private static UserResponse.PermissionInfo mapPermission(Permission permission) {
        if (permission == null) {
            return null;
        }

        return UserResponse.PermissionInfo.builder()
                .id(permission.getId())
                .name(permission.getName())
                .apiPath(permission.getApiPath())
                .method(permission.getMethod())
                .module(permission.getModule())
                .build();
    }

    /**
     * Map Patient entity to PatientInfo DTO
     */
    private static UserResponse.PatientInfo mapPatientProfile(Patient patient) {
        if (patient == null) {
            return null;
        }

        return UserResponse.PatientInfo.builder()
                .id(patient.getId())
                .address(patient.getAddress())
                .phone(patient.getPhone())
                .birthday(patient.getBirthday())
                .gender(patient.getGender() != null ? patient.getGender().name() : null)
                .identityNumber(patient.getIdentityNumber())
                .bloodType(patient.getBloodType() != null ? patient.getBloodType().name() : null)
                .heightCm(patient.getHeightCm())
                .weightKg(patient.getWeightKg())
                .occupation(patient.getOccupation())
                .lifestyleNotes(patient.getLifestyleNotes())
                .insuranceNumber(patient.getInsuranceNumber())
                .consentForAIAnalysis(patient.isConsentForAIAnalysis())
                .build();
    }

    /**
     * Map Center entity to CenterInfo DTO
     */
    private static UserResponse.CenterInfo mapCenter(Center center) {
        if (center == null) {
            return null;
        }

        return UserResponse.CenterInfo.builder()
                .centerId(center.getCenterId())
                .name(center.getName())
                .image(center.getImage())
                .address(center.getAddress())
                .phoneNumber(center.getPhoneNumber())
                .capacity(center.getCapacity())
                .workingHours(center.getWorkingHours())
                .build();
    }

    /**
     * Convert User to DoctorResponse (for backward compatibility)
     */
    public static DoctorResponse toResponse(User user) {
        return DoctorResponse.builder()
                .doctorId(user.getId())
                .doctorName(user.getFullName())
                .build();
    }
}
