package com.dapp.backend.dto.response;

import com.dapp.backend.enums.AppointmentStatus;
import com.dapp.backend.enums.TimeSlotEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescheduleAppointmentResponse {
    private Long appointmentId;
    private LocalDate oldDate;
    private TimeSlotEnum oldTimeSlot;
    private LocalDate newDate;
    private TimeSlotEnum newTimeSlot;
    private AppointmentStatus status;
    private String message;
}

