package com.dapp.backend.dto.request;

import com.dapp.backend.enums.VaccinationSite;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CompleteAppointmentRequest {

    String lotNumber;
    LocalDate expiryDate;
    VaccinationSite site;
    String notes;


    Double height;
    Double weight;
    Double temperature;
    Integer pulse;
    Integer systolic;
    Integer diastolic;


    String adverseReactions;
}
