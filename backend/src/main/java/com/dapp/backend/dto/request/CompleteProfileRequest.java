package com.dapp.backend.dto.request;

import com.dapp.backend.enums.BloodType;
import com.dapp.backend.enums.Gender;
import com.dapp.backend.validation.ValidBirthday;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteProfileRequest {

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{9,11}$", message = "Phone must be 9-11 digits")
    private String phone;

    @ValidBirthday(required = true, maxAge = 150)
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthday;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotBlank(message = "Identity number / Personal ID code is required")
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
