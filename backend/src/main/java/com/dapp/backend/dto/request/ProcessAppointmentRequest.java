package com.dapp.backend.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProcessAppointmentRequest {
    Long appointmentId;
    Long doctorId; // This is actually doctorId from Doctor entity, not userId
    Long slotId; // ID of the selected DoctorAvailableSlot
    LocalTime actualScheduledTime; // The actual scheduled time
}
