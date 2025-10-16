package com.dapp.backend.dto.request;

import com.dapp.backend.enums.BloodType;
import com.dapp.backend.enums.Gender;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateAccountRequest {

    UserRequest user;
    PatientProfileRequest patientProfile;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class UserRequest {
        String fullName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class PatientProfileRequest {
        String address;
        String phone;
        LocalDate birthday;
        Gender gender;
        String identityNumber;
        BloodType bloodType;
        Double heightCm;
        Double weightKg;
        String occupation;
        String lifestyleNotes;
        String insuranceNumber;
    }
}
