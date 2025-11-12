package com.dapp.backend.dto.request;

import com.dapp.backend.enums.AppointmentEnum;
import com.dapp.backend.enums.BookingEnum;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProcessAppointmentBlcRequest {
    String doctor;
    String cashier;
}
