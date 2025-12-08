package com.dapp.backend.dto.request;

import com.dapp.backend.enums.MethodPaymentEnum;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingRequest {
    long vaccineId;
    Long familyMemberId;
    

    LocalDate appointmentDate;
    String appointmentTime;
    Long appointmentCenter;
    
    double amount;
    MethodPaymentEnum paymentMethod;
}
