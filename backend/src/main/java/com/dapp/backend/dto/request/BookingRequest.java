package com.dapp.backend.dto.request;

import com.dapp.backend.util.MethodPaymentEnum;
import lombok.Data;

@Data
public class BookingRequest {
    private Long paymentId;
    private Long bookingId;
}
