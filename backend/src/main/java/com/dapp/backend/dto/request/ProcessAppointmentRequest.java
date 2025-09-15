package com.dapp.backend.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProcessAppointmentRequest {
    Long appointmentId;
    Long doctorId;
}
