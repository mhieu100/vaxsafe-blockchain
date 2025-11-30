package com.dapp.backend.dto.request;

import java.time.LocalDate;

import com.dapp.backend.enums.MethodPaymentEnum;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingRequest {
    long vaccineId;
    Long familyMemberId;
    
    // Single appointment info
    LocalDate appointmentDate;
    String appointmentTime; // Will be converted to TimeSlotEnum
    Long appointmentCenter;
    
    double amount;
    MethodPaymentEnum paymentMethod;
}
