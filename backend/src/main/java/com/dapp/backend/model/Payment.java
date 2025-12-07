package com.dapp.backend.model;

import com.dapp.backend.enums.MethodPaymentEnum;
import com.dapp.backend.enums.PaymentEnum;
import com.dapp.backend.enums.TypeTransactionEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    Long referenceId;
    TypeTransactionEnum referenceType;

    MethodPaymentEnum method;
    Double amount;
    String currency;
    PaymentEnum status;
}
