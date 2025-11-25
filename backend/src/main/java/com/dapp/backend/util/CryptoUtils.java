package com.dapp.backend.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * Utility class for cryptographic operations
 */
public class CryptoUtils {

    /**
     * Generate HMAC SHA512 hash
     * @param key Secret key
     * @param data Data to hash
     * @return Hex string of the hash
     */
    public static String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(
                    key.getBytes(StandardCharsets.UTF_8), 
                    "HmacSHA512"
            );
            hmac.init(secretKey);
            byte[] hashBytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hashBytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate HMAC-SHA512 hash", e);
        }
    }

    /**
     * Convert byte array to hex string
     * @param bytes Byte array
     * @return Hex string
     */
    public static String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}
