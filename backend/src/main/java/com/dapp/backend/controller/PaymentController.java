package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
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
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    @Value("${frontend.success-url}")
    private String frontendSuccessUrl;

    @Value("${frontend.cancel-url}")
    private String frontendCancelUrl;

    private final PaymentService paymentService;

    @GetMapping("/paypal/success")
    @ApiMessage("Handle PayPal payment success callback")
    public void successPaypal(HttpServletResponse response, @RequestParam String referenceId, @RequestParam String type,
            @RequestParam String payment, @RequestParam(required = false) String platform)
            throws AppException, IOException {
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setPaymentId(Long.parseLong(payment));
        paymentRequest.setReferenceId(referenceId);
        paymentRequest.setType(TypeTransactionEnum.valueOf(type));
        paymentService.successPayment(paymentRequest);

        if ("mobile".equals(platform)) {
            response.sendRedirect("myapp://payment/success?referenceId=" + referenceId + "&payment=" + payment);
        } else {
            response.sendRedirect(frontendSuccessUrl);
        }
    }

    @GetMapping("/paypal/cancel")
    @ApiMessage("Handle PayPal payment cancel callback")
    public void cancelPaypal(HttpServletResponse response, @RequestParam String referenceId, @RequestParam String type,
            @RequestParam String payment, @RequestParam(required = false) String platform)
            throws AppException, IOException {
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setPaymentId(Long.parseLong(payment));
        paymentRequest.setReferenceId(referenceId);
        paymentRequest.setType(TypeTransactionEnum.valueOf(type));
        paymentService.cancelPayment(paymentRequest);

        if ("mobile".equals(platform)) {
            response.sendRedirect("myapp://payment/cancel?referenceId=" + referenceId + "&payment=" + payment);
        } else {
            response.sendRedirect(frontendCancelUrl);
        }
    }

    @GetMapping("/vnpay/return")
    @ApiMessage("Handle VNPay payment return callback")
    public void handleVnpayReturn(HttpServletRequest request, HttpServletResponse response)
            throws IOException, AppException {
        String redirectUrl;
        Map<String, String> vnpParams = VnpayUtils.extractParams(request);

        String paymentId = vnpParams.remove("payment");
        String referenceId = vnpParams.remove("referenceId");
        String type = vnpParams.remove("type");
        String platform = vnpParams.remove("platform");

        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setPaymentId(Long.parseLong(paymentId));
        paymentRequest.setReferenceId(referenceId);
        paymentRequest.setType(TypeTransactionEnum.valueOf(type));


        if ("00".equals(vnpParams.get("vnp_ResponseCode"))) {
            paymentService.successPayment(paymentRequest);
            if ("mobile".equals(platform)) {
                redirectUrl = "myapp://payment/success?referenceId=" + referenceId + "&payment=" + paymentId;
            } else {
                redirectUrl = frontendSuccessUrl;
            }
        } else {
            paymentService.cancelPayment(paymentRequest);
            if ("mobile".equals(platform)) {
                redirectUrl = "myapp://payment/cancel?referenceId=" + referenceId + "&payment=" + paymentId;
            } else {
                redirectUrl = frontendCancelUrl;
            }
        }
        response.sendRedirect(redirectUrl);
    }

    @PostMapping("/meta-mask")
    @ApiMessage("Update payment with MetaMask")
    public void updatePaymentMetaMask(@RequestBody PaymentRequest request) throws AppException {
        paymentService.updatePaymentMetaMask(request);
    }
}
