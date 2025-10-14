package com.dapp.backend.dto.response;

import com.dapp.backend.enums.AppointmentEnum;
import com.dapp.backend.enums.BookingEnum;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class BookingResponse {
    Long id;
    String patientName;
    String vaccineName;
    String centerName;
    double totalAmount;
    BookingEnum status;
    List<AppointmentResponse> appointments;

    @Data
    public static class AppointmentResponse {
        Long id;
        Integer doseNumber;
        LocalDate scheduledDate;
        LocalTime scheduledTime;
        String centerName;
        AppointmentEnum status;
    }
}
