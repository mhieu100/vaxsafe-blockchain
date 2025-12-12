package com.dapp.backend.dto.response;

import com.dapp.backend.enums.AppointmentStatus;
import com.dapp.backend.enums.TimeSlotEnum;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class AppointmentResponse {
    Long id;
    Integer doseNumber;
    LocalDate scheduledDate;
    TimeSlotEnum scheduledTimeSlot;
    LocalTime actualScheduledTime;
    LocalDate desiredDate;
    TimeSlotEnum desiredTimeSlot;
    LocalDateTime rescheduledAt;
    AppointmentStatus appointmentStatus;
    Long patientId;
    String patientName;
    String patientPhone;
    String cashierName;
    String doctorName;
    String vaccineName;
    String vaccineSlug;
    Long centerId;
    String centerName;
    String centerAddress;

    Long paymentId;
    String paymentStatus;
    String paymentMethod;
    Double paymentAmount;
    Long familyMemberId;
    Long vaccinationCourseId;
    Integer vaccineTotalDoses;
    LocalDateTime createdAt;
    String patientEmail;
}
