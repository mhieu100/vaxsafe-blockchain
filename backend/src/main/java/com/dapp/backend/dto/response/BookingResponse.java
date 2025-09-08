package com.dapp.backend.dto.response;

import com.dapp.backend.util.MethodPaymentEnum;
import lombok.Data;

@Data
public class BookingResponse {
    private Long paymentId;
    private Long bookingId;
    private MethodPaymentEnum method;
    private String paymentURL;
    private Double amount;
}
