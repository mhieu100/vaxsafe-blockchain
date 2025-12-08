package com.dapp.backend.dto.response;

import com.dapp.backend.enums.AppointmentStatus;
import com.dapp.backend.enums.TimeSlotEnum;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UrgentAppointmentDto {
    Long id;
    Long bookingId;
    String patientName;
    String patientPhone;
    String patientEmail;
    String vaccineName;
    Integer doseNumber;


    LocalDate scheduledDate;
    TimeSlotEnum scheduledTimeSlot;
    java.time.LocalTime actualScheduledTime;


    LocalDate desiredDate;
    TimeSlotEnum desiredTimeSlot;
    java.time.LocalTime actualDesiredTime;
    String rescheduleReason;
    LocalDateTime rescheduledAt;


    String doctorName;
    String cashierName;

    String centerName;

    AppointmentStatus status;

    String urgencyType;
    String urgencyMessage;
    Integer priorityLevel;
}
