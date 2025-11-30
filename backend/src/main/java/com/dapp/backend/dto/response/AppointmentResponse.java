package com.dapp.backend.dto.response;

import com.dapp.backend.enums.AppointmentEnum;
import com.dapp.backend.enums.TimeSlotEnum;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AppointmentResponse {
    Long id;
    Integer doseNumber;
    LocalDate scheduledDate;
    TimeSlotEnum scheduledTimeSlot;
    java.time.LocalTime actualScheduledTime;
    LocalDate desiredDate;
    TimeSlotEnum desiredTimeSlot;
    String rescheduleReason;
    LocalDateTime rescheduledAt;
    AppointmentEnum status;
    Long bookingId;
    String patientName;
    String patientPhone;
    String cashierName;
    String doctorName;
    String vaccineName;
    Long centerId;
    String centerName;
    
    // Payment information
    Long paymentId;
    String paymentStatus;
    String paymentMethod;
    Double paymentAmount;
}
