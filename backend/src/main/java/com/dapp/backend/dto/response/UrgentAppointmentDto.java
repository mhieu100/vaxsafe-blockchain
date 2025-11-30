package com.dapp.backend.dto.response;

import com.dapp.backend.enums.AppointmentEnum;
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

    // Scheduled info
    LocalDate scheduledDate;
    TimeSlotEnum scheduledTimeSlot;
    java.time.LocalTime actualScheduledTime;

    // Reschedule info (if applicable)
    LocalDate desiredDate;
    TimeSlotEnum desiredTimeSlot;
    java.time.LocalTime actualDesiredTime;
    String rescheduleReason;
    LocalDateTime rescheduledAt;

    // Doctor and Cashier info
    String doctorName;
    String cashierName;

    // Center info
    String centerName;

    // Status
    AppointmentEnum status;

    // Urgency info
    String urgencyType; // RESCHEDULE_PENDING, NO_DOCTOR, COMING_SOON, OVERDUE
    String urgencyMessage;
    Integer priorityLevel; // 1 = highest, 5 = lowest
}
