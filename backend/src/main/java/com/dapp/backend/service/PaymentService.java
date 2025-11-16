package com.dapp.backend.service;

import com.dapp.backend.dto.request.PaymentRequest;
import com.dapp.backend.enums.*;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Booking;
import com.dapp.backend.model.Order;
import com.dapp.backend.repository.BookingRepository;
import com.dapp.backend.repository.OrderRepository;
import com.dapp.backend.repository.PaymentRepository;
import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final BookingRepository bookingRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final APIContext apiContext;
    public static final double EXCHANGE_RATE_TO_USD = 0.000041;

    // Vnpay
    @Value("${vnpay.url}")
    private String vnpayUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    @Value("${vnpay.version}")
    private String version;

    @Value("${vnpay.command}")
    private String command;

    @Value("${vnpay.order-type}")
    private String orderType;

    public String createBankUrl(long amount, Long referenceId, Long paymentId, TypeTransactionEnum type, String ipAddress) throws UnsupportedEncodingException {
        String customReturnUrl = returnUrl;

        char separator = customReturnUrl.contains("?") ? '&' : '?';

        String encodedPaymentId = URLEncoder.encode(paymentId.toString(), StandardCharsets.UTF_8);
        String encodedType = URLEncoder.encode(type.toString(), StandardCharsets.UTF_8);
        String encodedReferenceId = URLEncoder.encode(referenceId.toString(), StandardCharsets.UTF_8);

        customReturnUrl += separator + "payment=" + encodedPaymentId;
        customReturnUrl += "&type=" + encodedType;
        customReturnUrl += "&referenceId=" + encodedReferenceId;

        // VNPay parameters
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", version);
        vnpParams.put("vnp_Command", command);
        vnpParams.put("vnp_TmnCode", tmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount * 100)); // Amount in VND (multiply by 100)
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", String.valueOf(System.currentTimeMillis()));
        vnpParams.put("vnp_OrderInfo", String.valueOf(referenceId));
        vnpParams.put("vnp_OrderType", orderType);
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", customReturnUrl);
        vnpParams.put("vnp_IpAddr", ipAddress);
        vnpParams.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

        // Sort parameters alphabetically
        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        // Build hash data
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = vnpParams.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append("=").append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8)).append("=").append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                if (fieldNames.indexOf(fieldName) < fieldNames.size() - 1) {
                    hashData.append("&");
                    query.append("&");
                }
            }
        }

        // Generate secure hash
        String vnpSecureHash = hmacSHA512(hashSecret, hashData.toString());
        query.append("&vnp_SecureHashType=SHA256&vnp_SecureHash=").append(vnpSecureHash);

        return vnpayUrl + "?" + query.toString();
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] hashBytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hashBytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate HMAC-SHA512 hash", e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }


    // Paypal
    public String createPaypalUrl(Double amount, Long referenceId, Long paymentId, TypeTransactionEnum type) throws PayPalRESTException {
        Payment payment = createPayment(
                amount * EXCHANGE_RATE_TO_USD,
                "USD",
                "paypal",
                "sale",
                "Payment description",
                "http://localhost:8080/payments/paypal/cancel?referenceId="+referenceId+"&type="+type+"&payment="+paymentId,
                "http://localhost:8080/payments/paypal/success?referenceId="+referenceId+"&type="+type+"&payment="+paymentId
        );

        for (Links link : payment.getLinks()) {
            if (link.getRel().equals("approval_url")) {
                return  link.getHref();
            }
        }
        return null;
    }

    public Payment createPayment(
            Double total,
            String currency,
            String method,
            String intent,
            String description,
            String cancelUrl,
            String successUrl) throws PayPalRESTException {

        Amount amount = new Amount();
        amount.setCurrency(currency);
        amount.setTotal(String.format("%.2f", total));

        Transaction transaction = new Transaction();
        transaction.setDescription(description);
        transaction.setAmount(amount);

        List<Transaction> transactions = new ArrayList<>();
        transactions.add(transaction);

        Payer payer = new Payer();
        payer.setPaymentMethod(method);

        Payment payment = new Payment();
        payment.setIntent(intent);
        payment.setPayer(payer);
        payment.setTransactions(transactions);

        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl(cancelUrl);
        redirectUrls.setReturnUrl(successUrl);
        payment.setRedirectUrls(redirectUrls);

        return payment.create(apiContext);
    }

    public void successPayment(PaymentRequest request) throws AppException {
        com.dapp.backend.model.Payment payment = paymentRepository.findById(request.getPaymentId()).orElseThrow(() -> new AppException("Payment not found!"));
        if(request.getType() == TypeTransactionEnum.ORDER) {
            Order order = orderRepository.findById(Long.parseLong(request.getReferenceId())).orElseThrow(() -> new AppException("Order not found!"));
            order.setStatus(OrderStatus.PROCESSING);
            payment.setReferenceType(request.getType());
        } else {
            Booking booking = bookingRepository.findById(Long.parseLong(request.getReferenceId())).orElseThrow(() -> new AppException("Booking not found!"));
            booking.setStatus(BookingEnum.CONFIRMED);
            bookingRepository.save(booking);

            payment.setReferenceType(request.getType());
        }
        payment.setStatus(PaymentEnum.SUCCESS);
        paymentRepository.save(payment);
    }

    public void cancelPayment(PaymentRequest request) throws AppException {
        com.dapp.backend.model.Payment payment = paymentRepository.findById(request.getPaymentId()).orElseThrow(() -> new AppException("Payment not found!"));
        if(request.getType() == TypeTransactionEnum.ORDER) {
            Order order = orderRepository.findById(Long.parseLong(request.getReferenceId())).orElseThrow(() -> new AppException("Order not found!"));
            order.setStatus(OrderStatus.CANCELLED);
            payment.setReferenceType(request.getType());
        } else {
            Booking booking = bookingRepository.findById(Long.parseLong(request.getReferenceId())).orElseThrow(() -> new AppException("Booking not found!"));
            booking.setStatus(BookingEnum.CANCELLED);
            bookingRepository.save(booking);
            payment.setReferenceType(request.getType());
        }
        payment.setStatus(PaymentEnum.FAILED);
        paymentRepository.save(payment);
    }

    public void updatePaymentMetaMask(PaymentRequest request) throws AppException {
        Booking booking = bookingRepository.findById(Long.parseLong(request.getReferenceId())).orElseThrow(() -> new AppException("Booking not found!"));
        com.dapp.backend.model.Payment payment = paymentRepository.findById(request.getPaymentId()).orElseThrow(() -> new AppException("Payment not found!"));
        booking.setStatus(BookingEnum.CONFIRMED);
        payment.setStatus(PaymentEnum.SUCCESS);
        bookingRepository.save(booking);
        paymentRepository.save(payment);
    }
}
