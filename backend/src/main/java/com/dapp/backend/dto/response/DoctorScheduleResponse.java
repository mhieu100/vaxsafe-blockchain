package com.dapp.backend.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorScheduleResponse {
    Long scheduleId;
    Long doctorId;
    Integer dayOfWeek; // 0=Sunday, 1=Monday, ..., 6=Saturday
    String dayName; // "Monday", "Tuesday", etc.
    LocalTime startTime;
    LocalTime endTime;
    Boolean isActive;
}
