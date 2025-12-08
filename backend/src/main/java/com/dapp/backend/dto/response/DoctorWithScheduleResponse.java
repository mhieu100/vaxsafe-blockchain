package com.dapp.backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorWithScheduleResponse {
    Long doctorId;
    Long userId;
    String doctorName;
    String email;
    String avatar;
    String phone;
    String licenseNumber;
    String specialization;
    Integer consultationDuration;
    Integer maxPatientsPerDay;
    Boolean isAvailable;
    Long centerId;
    String centerName;
    

    Integer totalSlotsToday;
    Integer availableSlotsToday;
    Integer bookedSlotsToday;
    Integer blockedSlotsToday;
    

    List<DoctorAvailableSlotResponse> todaySchedule;
    

    String workingHoursToday;
}
