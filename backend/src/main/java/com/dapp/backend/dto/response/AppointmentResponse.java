package com.dapp.backend.dto.response;

import com.dapp.backend.enums.AppointmentEnum;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentResponse {
    Long id;
    Integer doseNumber;
    LocalDate scheduledDate;
    LocalTime scheduledTime;
    AppointmentEnum status;
    Long bookingId;
    String patientName;
    String cashierName;
    String doctorName;
    String vaccineName;
    String centerName;
}
