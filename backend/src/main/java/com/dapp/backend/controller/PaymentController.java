package com.dapp.backend.controller;

import com.dapp.backend.dto.request.BookingRequest;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/paypal")
    public void updatePaymentPaypal(@RequestBody BookingRequest request) throws AppException {
        paymentService.updatePaymentPaypal(request);
    }
}
