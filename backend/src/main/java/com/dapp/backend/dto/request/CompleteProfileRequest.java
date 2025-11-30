package com.dapp.backend.dto.request;

import com.dapp.backend.enums.BloodType;
import com.dapp.backend.enums.Gender;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request to complete patient profile after initial registration
 * Used for both password and Google registration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteProfileRequest {
    
    @Valid
    @NotNull(message = "Patient profile is required")
    private PatientProfile patientProfile;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientProfile {
        
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
        @Pattern(regexp = "^[0-9]{9,12}$", message = "Identity number must be 9-12 digits")
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
        
        @Builder.Default
        private boolean consentForAIAnalysis = false;
    }
}
