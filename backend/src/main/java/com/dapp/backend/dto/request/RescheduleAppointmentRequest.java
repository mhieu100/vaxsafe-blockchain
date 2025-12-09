package com.dapp.backend.dto.request;

import com.dapp.backend.enums.TimeSlotEnum;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RescheduleAppointmentRequest {
    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotNull(message = "Desired date is required")
    @Future(message = "Desired date must be in the future")
    private LocalDate desiredDate;

    @NotNull(message = "Desired time is required")
    private TimeSlotEnum desiredTimeSlot;

}
