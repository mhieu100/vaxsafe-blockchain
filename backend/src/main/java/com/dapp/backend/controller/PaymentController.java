package com.dapp.backend.controller;

import com.dapp.backend.dto.request.BookingRequest;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/paypal")
    public void updatePaymentPaypal(@RequestBody BookingRequest request) throws AppException {
        paymentService.updatePaymentPaypal(request);
    }

    @PostMapping("/meta-mask")
    public void updatePaymentMetaMask(@RequestBody BookingRequest request) throws AppException {
        paymentService.updatePaymentMetaMask(request);
    }
}
