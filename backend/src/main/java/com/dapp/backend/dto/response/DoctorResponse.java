package com.dapp.backend.dto.response;


import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;


@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorResponse {
    Long doctorId;
    Long userId;
    String doctorName;
    String email;
    String avatar;
    String licenseNumber;
    String specialization;
    Integer consultationDuration;
    Integer maxPatientsPerDay;
    Boolean isAvailable;
    

    Long centerId;
    String centerName;
}