package com.dapp.backend.controller;

import com.dapp.backend.dto.request.PaymentRequest;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.service.PaymentService;
import com.dapp.backend.util.VnpayUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    @Value("${vnpay.hash-secret}")
    private String hashSecret;
    private final PaymentService paymentService;

    @PostMapping("/paypal")
    public void updatePaymentPaypal(@RequestBody PaymentRequest request) throws AppException {
        paymentService.updatePaymentPaypal(request);
    }

    @GetMapping("/vnpay/return")
    public void handleVnpayReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, String> vnpParams = VnpayUtils.extractParams(request);
        System.out.println(vnpParams);
        String secureHash = vnpParams.remove("vnp_SecureHash");

//        boolean isValid = VnpayUtils.verifySignature(vnpParams, secureHash, hashSecret);
        String redirectUrl;

//        if (isValid && "00".equals(vnpParams.get("vnp_ResponseCode"))) {
        if ("00".equals(vnpParams.get("vnp_ResponseCode"))) {
            // thanh toán thành công
            redirectUrl = "http://localhost:3000/success?status=success&orderId=" + vnpParams.get("vnp_TxnRef");
            System.out.println("Oke");
        } else {
            redirectUrl = "http://localhost:3000/cancel?status=failed&orderId=" + vnpParams.get("vnp_TxnRef");
            System.out.println("Faile");
        }

        response.sendRedirect(redirectUrl);
    }

    @PostMapping("/meta-mask")
    public void updatePaymentMetaMask(@RequestBody PaymentRequest request) throws AppException {
        paymentService.updatePaymentMetaMask(request);
    }
}
