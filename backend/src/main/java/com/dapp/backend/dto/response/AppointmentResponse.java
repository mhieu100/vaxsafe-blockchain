package com.dapp.backend.dto.response;

import com.dapp.backend.enums.AppointmentStatus;
import com.dapp.backend.enums.TimeSlotEnum;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AppointmentResponse {
    Long id;
    Long patientId;
    Integer doseNumber;
    LocalDate scheduledDate;
    TimeSlotEnum scheduledTimeSlot;
    java.time.LocalTime actualScheduledTime;
    LocalDate desiredDate;
    TimeSlotEnum desiredTimeSlot;
    String rescheduleReason;
    LocalDateTime rescheduledAt;
    AppointmentStatus status;
    String patientName;
    String patientPhone;
    String cashierName;
    String doctorName;
    String vaccineName;
    String vaccineSlug;
    Long centerId;
    String centerName;

    Long paymentId;
    String paymentStatus;
    String paymentMethod;
    Double paymentAmount;
    Long familyMemberId;
    Integer vaccineTotalDoses;
    LocalDateTime createdAt;
}
