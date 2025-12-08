package com.dapp.backend.util;

import jakarta.servlet.http.HttpServletRequest;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class VnpayUtils {

    
    public static Map<String, String> extractParams(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();


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

    
    public static boolean verifySignature(Map<String, String> fields, String receivedHash, String secretKey) {

        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");


        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);


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


        String signData = sb.toString();
        String computedHash = CryptoUtils.hmacSHA512(secretKey, signData);

        return computedHash.equalsIgnoreCase(receivedHash);
    }
}