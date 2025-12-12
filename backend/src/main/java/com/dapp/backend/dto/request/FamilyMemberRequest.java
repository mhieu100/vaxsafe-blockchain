package com.dapp.backend.dto.request;

import com.dapp.backend.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMemberRequest {
    private Long id;

    @NotBlank(message = "Full name is required.")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters.")
    private String fullName;

    @NotNull(message = "Date of birth is required.")
    @Past(message = "Date of birth must be in the past.")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dateOfBirth;

    @NotBlank(message = "Relationship is required.")
    private String relationship;

    // Identity number is optional for children
    @Pattern(regexp = "^$|^[0-9]{9,12}$", message = "Identity number must be 9-12 digits")
    private String identityNumber;

    @Pattern(regexp = "^\\+?[0-9\\s()-]{7,20}$", message = "Invalid phone number format.")
    private String phone;

    @NotNull(message = "Gender is required.")
    private Gender gender;

    private Double heightCm;
    private Double weightKg;

}