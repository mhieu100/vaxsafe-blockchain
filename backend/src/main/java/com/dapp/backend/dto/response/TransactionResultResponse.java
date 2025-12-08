package com.dapp.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResultResponse {
    private String status;
    private String referenceType;
    private Double amount;
    private String transactionId;

    // Booking info
    private String vaccineName;
    private String centerName;
    private LocalDate scheduledDate;
    private String scheduledTime;
    private String patientName;
    private String emailSentTo;
}
