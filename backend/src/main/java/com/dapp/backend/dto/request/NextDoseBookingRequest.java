package com.dapp.backend.dto.request;

import com.dapp.backend.enums.MethodPaymentEnum;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NextDoseBookingRequest {
    @NotNull(message = "Vaccination Course ID is required")
    Long vaccinationCourseId;

    LocalDate appointmentDate;
    String appointmentTime;
    Long appointmentCenter;

    double amount;
    MethodPaymentEnum paymentMethod;
}
