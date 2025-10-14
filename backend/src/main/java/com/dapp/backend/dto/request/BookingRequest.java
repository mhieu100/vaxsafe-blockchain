package com.dapp.backend.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.dapp.backend.enums.MethodPaymentEnum;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingRequest {
    long vaccineId;
    Long familyMemberId;
    long centerId;

    LocalDate firstDoseDate;
    LocalTime firstDoseTime;
    double amount;
    List<DoseSchedule> doseSchedules;
    MethodPaymentEnum paymentMethod;

    @Data
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class DoseSchedule {
        LocalDate date;
        LocalTime time;
        long centerId;
    }
}
