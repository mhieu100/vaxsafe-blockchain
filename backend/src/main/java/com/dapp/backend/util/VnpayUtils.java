package com.dapp.backend.util;

import jakarta.servlet.http.HttpServletRequest;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class VnpayUtils {

    /**
     * Extract toàn bộ query params từ HttpServletRequest
     * Bỏ qua các tham số null hoặc rỗng.
     */
    public static Map<String, String> extractParams(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();

        // Lấy toàn bộ param từ URL query
        Enumeration<String> params = request.getParameterNames();
        while (params.hasMoreElements()) {
            String name = params.nextElement();
            String value = request.getParameter(name);
            if (value != null && !value.isEmpty()) {
                fields.put(name, value);
            }
        }

        return fields;
    }

    /**
     * Verify chữ ký (SecureHash) từ VNPAY trả về
     */
    public static boolean verifySignature(Map<String, String> fields, String receivedHash, String secretKey) {
        // Bỏ 2 tham số này trước khi ký lại
        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        // Sort theo key (theo quy định của VNPAY)
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);

        // Nối lại thành chuỗi query string (URL encode giá trị)
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < fieldNames.size(); i++) {
            String key = fieldNames.get(i);
            String value = fields.get(key);
            if (value != null && !value.isEmpty()) {
                sb.append(key).append('=')
                        .append(URLEncoder.encode(value, StandardCharsets.US_ASCII));
                if (i < fieldNames.size() - 1) sb.append('&');
            }
        }

        // Ký lại bằng HMAC SHA512
        String signData = sb.toString();
        String computedHash = CryptoUtils.hmacSHA512(secretKey, signData);

        return computedHash.equalsIgnoreCase(receivedHash);
    }
}