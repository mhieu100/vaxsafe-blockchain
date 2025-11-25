package com.dapp.backend.service;

import com.dapp.backend.enums.TypeTransactionEnum;
import com.dapp.backend.util.CryptoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VnpayService {

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

    /**
     * Create VNPay payment URL
     */
    public String createPaymentUrl(long amount, Long referenceId, Long paymentId, TypeTransactionEnum type, String ipAddress) throws UnsupportedEncodingException {
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
        String vnpSecureHash = CryptoUtils.hmacSHA512(hashSecret, hashData.toString());
        query.append("&vnp_SecureHashType=SHA256&vnp_SecureHash=").append(vnpSecureHash);

        return vnpayUrl + "?" + query.toString();
    }
}
