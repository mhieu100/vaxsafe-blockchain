package com.dapp.backend.controller;

import com.dapp.backend.dto.request.PaymentRequest;
import com.dapp.backend.enums.TypeTransactionEnum;
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

    @GetMapping("/paypal/success")
    public void successPaypal(HttpServletResponse response, @RequestParam String referenceId, @RequestParam String type,@RequestParam String payment) throws AppException, IOException {
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setPaymentId(Long.parseLong(payment));
        paymentRequest.setReferenceId(referenceId);
        paymentRequest.setType(TypeTransactionEnum.valueOf(type));
        paymentService.successPayment(paymentRequest);
        response.sendRedirect("http://localhost:3000/success");
    }

    @GetMapping("/paypal/cancel")
    public void cancelPaypal(HttpServletResponse response, @RequestParam String referenceId, @RequestParam String type,@RequestParam String payment) throws AppException, IOException {
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setPaymentId(Long.parseLong(payment));
        paymentRequest.setReferenceId(referenceId);
        paymentRequest.setType(TypeTransactionEnum.valueOf(type));
        paymentService.cancelPayment(paymentRequest);
        response.sendRedirect("http://localhost:3000/cancel");
    }

    @GetMapping("/vnpay/return")
    public void handleVnpayReturn(HttpServletRequest request, HttpServletResponse response) throws IOException, AppException {
        String redirectUrl;
        Map<String, String> vnpParams = VnpayUtils.extractParams(request);

        String paymentId = vnpParams.remove("payment");
        String referenceId = vnpParams.remove("referenceId");
        String type = vnpParams.remove("type");

        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setPaymentId(Long.parseLong(paymentId));
        paymentRequest.setReferenceId(referenceId);
        paymentRequest.setType(TypeTransactionEnum.valueOf(type));

//        String secureHash = vnpParams.remove("vnp_SecureHash");
//        boolean isValid = VnpayUtils.verifySignature(vnpParams, secureHash, hashSecret);
//        if (isValid && "00".equals(vnpParams.get("vnp_ResponseCode"))) {

        if ("00".equals(vnpParams.get("vnp_ResponseCode"))) {
            paymentService.successPayment(paymentRequest);
            redirectUrl = "http://localhost:3000/success";
        } else {
            paymentService.cancelPayment(paymentRequest);
            redirectUrl = "http://localhost:3000/cancel";
        }
        response.sendRedirect(redirectUrl);
    }

    @PostMapping("/meta-mask")
    public void updatePaymentMetaMask(@RequestBody PaymentRequest request) throws AppException {
        paymentService.updatePaymentMetaMask(request);
    }
}
