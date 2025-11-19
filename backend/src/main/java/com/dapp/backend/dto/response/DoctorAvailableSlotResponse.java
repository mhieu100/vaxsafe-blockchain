package com.dapp.backend.dto.response;

import com.dapp.backend.enums.SlotStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorAvailableSlotResponse {
    Long slotId;
    Long doctorId;
    String doctorName;
    LocalDate slotDate;
    LocalTime startTime;
    LocalTime endTime;
    SlotStatus status;
    Long appointmentId;
    String notes;
}
