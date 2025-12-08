package com.dapp.backend.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProcessAppointmentRequest {
    Long appointmentId;
    Long doctorId;
    Long slotId;
    LocalTime actualScheduledTime;
}
