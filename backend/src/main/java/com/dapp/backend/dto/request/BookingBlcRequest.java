package com.dapp.backend.dto.request;

import com.dapp.backend.dto.response.BookingResponse;
import com.dapp.backend.enums.AppointmentEnum;
import com.dapp.backend.enums.BookingEnum;
import com.dapp.backend.enums.MethodPaymentEnum;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingBlcRequest {
    String vaccine;
    String patient;
    String identityNumber;
    double totalAmount;
    int totalDoses;
    List<AppointmentBlcResponse> appointments;

    BookingEnum bookingStatus;
    @Data
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class AppointmentBlcResponse {
        String center;
        Long appointmentId;
        Integer doseNumber;
        LocalDate scheduledDate;
        LocalTime scheduledTime;
        AppointmentEnum appointmentStatus;
    }
}
