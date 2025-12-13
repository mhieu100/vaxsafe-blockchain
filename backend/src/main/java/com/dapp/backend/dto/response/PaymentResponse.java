package com.dapp.backend.dto.response;

import com.dapp.backend.enums.PaymentMethod;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {
    Long paymentId;
    Long referenceId;
    PaymentMethod method;
    String paymentURL;
    Double amount;
}
