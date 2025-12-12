package com.dapp.backend.dto.response;

import com.dapp.backend.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMemberResponse {

    private long id;
    private String fullName;
    private LocalDate dateOfBirth;
    private String relationship;
    private String phone;
    private Gender gender;
    private long parentId;
    private String identityNumber;
    private Double heightCm;
    private Double weightKg;

    // Statistics
    private int totalVaccinations;
    private LocalDate lastVaccinationDate;
    private String vaccinationStatus; // UP_TO_DATE, OVERDUE, PARTIAL, NOT_STARTED
}