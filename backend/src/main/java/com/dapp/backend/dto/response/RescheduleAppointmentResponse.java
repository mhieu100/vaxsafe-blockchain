package com.dapp.backend.dto.response;

import com.dapp.backend.enums.AppointmentEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescheduleAppointmentResponse {
    private Long appointmentId;
    private LocalDate oldDate;
    private LocalTime oldTime;
    private LocalDate newDate;
    private LocalTime newTime;
    private AppointmentEnum status;
    private String message;
}

