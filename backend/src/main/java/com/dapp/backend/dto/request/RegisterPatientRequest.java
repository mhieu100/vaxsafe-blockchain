package com.dapp.backend.dto.request;

import com.dapp.backend.enums.BloodType;
import com.dapp.backend.enums.Gender;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterPatientRequest {

    @Valid
    @NotNull
    private UserRequest user;

    @Valid
    @NotNull
    private PatientProfileRequest patientProfile;


    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserRequest {
        private String avatar;

        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PatientProfileRequest {

        @NotBlank(message = "Address is required")
        private String address;

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[0-9]{9,11}$", message = "Phone must be 9-11 digits")
        private String phone;

        @NotNull(message = "Birthday is required")
        @Past(message = "Birthday must be in the past")
        private LocalDate birthday;

        @NotNull(message = "Gender is required")
        private Gender gender;

        @NotBlank(message = "Identity number is required")
        private String identityNumber;

        @NotNull(message = "Blood type is required")
        private BloodType bloodType;

        @Positive(message = "Height must be positive")
        private Double heightCm;

        @Positive(message = "Weight must be positive")
        private Double weightKg;

        private String occupation;

        private String lifestyleNotes;

        private String insuranceNumber;

        private boolean consentForAIAnalysis = false;
    }
}
