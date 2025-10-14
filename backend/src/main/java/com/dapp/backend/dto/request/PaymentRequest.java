package com.dapp.backend.dto.request;

import com.dapp.backend.enums.TypeTransactionEnum;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentRequest {
    Long paymentId;
    String referenceId;
    TypeTransactionEnum type;
}
