package com.dapp.backend.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;

import com.dapp.backend.enums.MethodPaymentEnum;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WalkInBookingRequest {
    @NotNull(message = "Patient ID is required")
    Long patientId;
    
    @NotNull(message = "Center ID is required")
    Long centerId;
    
    @NotNull(message = "Vaccine ID is required")
    Long vaccineId;
    
    @NotNull(message = "Doctor ID is required")
    Long doctorId;
    
    @NotNull(message = "Appointment date is required")
    LocalDate appointmentDate;
    
    @NotNull(message = "Appointment time slot is required")
    String appointmentTime; // TimeSlotEnum (e.g., "SLOT_13_00")
    
    @NotNull(message = "Actual scheduled time is required")
    LocalTime actualScheduledTime; // Actual time like 13:00:00
    
    Long slotId; // Can be null for virtual slots
    
    String notes;
    
    @NotNull(message = "Payment method is required")
    MethodPaymentEnum paymentMethod;
}
