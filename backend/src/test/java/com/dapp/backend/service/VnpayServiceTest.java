package com.dapp.backend.service;

import com.dapp.backend.enums.TypeTransactionEnum;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.UnsupportedEncodingException;
import java.lang.reflect.Field;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit test for VNPay payment URL generation
 * Tests the payment URL creation logic without Spring context
 */
class VnpayServiceTest {

    private VnpayService vnpayService;

    private Long testAmount;
    private Long testReferenceId;
    private Long testPaymentId;
    private TypeTransactionEnum testType;
    private String testIpAddress;
    private String testUserAgent;

    @BeforeEach
    void setUp() throws Exception {
        vnpayService = new VnpayService();
        
        // Inject test configuration values using reflection
        setField(vnpayService, "vnpayUrl", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        setField(vnpayService, "returnUrl", "http://localhost:8080/payments/vnpay/return");
        setField(vnpayService, "tmnCode", "TEST_TMN_CODE");
        setField(vnpayService, "hashSecret", "TEST_SECRET_KEY");
        setField(vnpayService, "version", "2.1.0");
        setField(vnpayService, "command", "pay");
        setField(vnpayService, "orderType", "other");
        
        testAmount = 100000L;
        testReferenceId = 12345L;
        testPaymentId = 67890L;
        testType = TypeTransactionEnum.APPOINTMENT;
        testIpAddress = "127.0.0.1";
        testUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
    }
    
    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    @Test
    void testCreatePaymentUrl_Success() throws UnsupportedEncodingException {
        // When
        String paymentUrl = vnpayService.createPaymentUrl(
            testAmount,
            testReferenceId,
            testPaymentId,
            testType,
            testIpAddress,
            testUserAgent
        );

        // Then
        assertNotNull(paymentUrl, "Payment URL should not be null");
        assertTrue(paymentUrl.startsWith("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"), 
            "Payment URL should start with VNPay sandbox URL");
        assertTrue(paymentUrl.contains("vnp_Amount=10000000"), 
            "Payment URL should contain amount in VND cents (100,000 * 100)");
        assertTrue(paymentUrl.contains("vnp_TmnCode=TEST_TMN_CODE"), 
            "Payment URL should contain TMN code");
        assertTrue(paymentUrl.contains("vnp_CurrCode=VND"), 
            "Payment URL should contain VND currency");
        
        // Decode the URL to check the vnp_ReturnUrl parameter contents
        String decodedUrl = URLDecoder.decode(paymentUrl, StandardCharsets.UTF_8);
        assertTrue(decodedUrl.contains("payment=" + testPaymentId), 
            "Return URL should contain payment ID");
        assertTrue(decodedUrl.contains("referenceId=" + testReferenceId), 
            "Return URL should contain reference ID");
        assertTrue(decodedUrl.contains("type=" + testType), 
            "Return URL should contain transaction type");
        assertTrue(decodedUrl.contains("platform=web"), 
            "Return URL should contain platform=web for web browser user agent");
        
        assertTrue(paymentUrl.contains("vnp_SecureHash="), 
            "Payment URL should contain secure hash");
        
        System.out.println("✅ Generated VNPay Payment URL:");
        System.out.println(paymentUrl);
    }

    @Test
    void testCreatePaymentUrl_WithMobileUserAgent() throws UnsupportedEncodingException {
        // Given - Android user agent
        String mobileUserAgent = "okhttp/4.9.0 (Android 11; Mobile)";

        // When
        String paymentUrl = vnpayService.createPaymentUrl(
            testAmount,
            testReferenceId,
            testPaymentId,
            testType,
            testIpAddress,
            mobileUserAgent
        );

        // Then
        assertNotNull(paymentUrl);
        
        // Decode the URL to check the vnp_ReturnUrl parameter contents
        String decodedUrl = URLDecoder.decode(paymentUrl, StandardCharsets.UTF_8);
        assertTrue(decodedUrl.contains("platform=mobile"), 
            "Return URL should contain platform=mobile for Android user agent");
        
        System.out.println("✅ Generated VNPay Payment URL (Mobile):");
        System.out.println(paymentUrl);
    }

    @Test
    void testCreatePaymentUrl_WithiOSUserAgent() throws UnsupportedEncodingException {
        // Given - iOS user agent
        String iosUserAgent = "MyApp/1.0 CFNetwork/1335.0.3 Darwin/21.6.0";

        // When
        String paymentUrl = vnpayService.createPaymentUrl(
            testAmount,
            testReferenceId,
            testPaymentId,
            testType,
            testIpAddress,
            iosUserAgent
        );

        // Then
        assertNotNull(paymentUrl);
        
        // Decode the URL to check the vnp_ReturnUrl parameter contents
        String decodedUrl = URLDecoder.decode(paymentUrl, StandardCharsets.UTF_8);
        assertTrue(decodedUrl.contains("platform=mobile"), 
            "Return URL should contain platform=mobile for iOS user agent");
    }

    @Test
    void testCreatePaymentUrl_WithNullUserAgent() throws UnsupportedEncodingException {
        // When
        String paymentUrl = vnpayService.createPaymentUrl(
            testAmount,
            testReferenceId,
            testPaymentId,
            testType,
            testIpAddress,
            null
        );

        // Then
        assertNotNull(paymentUrl);
        
        // Decode the URL to check the vnp_ReturnUrl parameter contents
        String decodedUrl = URLDecoder.decode(paymentUrl, StandardCharsets.UTF_8);
        assertTrue(decodedUrl.contains("platform=web"), 
            "Return URL should default to platform=web when user agent is null");
    }

    @Test
    void testCreatePaymentUrl_LargeAmount() throws UnsupportedEncodingException {
        // Given
        Long largeAmount = 50000000L; // 50 million VND

        // When
        String paymentUrl = vnpayService.createPaymentUrl(
            largeAmount,
            testReferenceId,
            testPaymentId,
            testType,
            testIpAddress,
            testUserAgent
        );

        // Then
        assertNotNull(paymentUrl);
        assertTrue(paymentUrl.contains("vnp_Amount=5000000000"), 
            "Should handle large amounts correctly (50,000,000 * 100)");
    }

    @Test
    void testCreatePaymentUrl_OrderType() throws UnsupportedEncodingException {
        // Given
        TypeTransactionEnum orderType = TypeTransactionEnum.ORDER;

        // When
        String paymentUrl = vnpayService.createPaymentUrl(
            testAmount,
            testReferenceId,
            testPaymentId,
            orderType,
            testIpAddress,
            testUserAgent
        );

        // Then
        assertNotNull(paymentUrl);
        
        // Decode the URL to check the vnp_ReturnUrl parameter contents
        String decodedUrl = URLDecoder.decode(paymentUrl, StandardCharsets.UTF_8);
        assertTrue(decodedUrl.contains("type=ORDER"), 
            "Return URL should contain ORDER transaction type");
    }

    @Test
    void testUrlStructure() throws UnsupportedEncodingException {
        // When
        String paymentUrl = vnpayService.createPaymentUrl(
            testAmount,
            testReferenceId,
            testPaymentId,
            testType,
            testIpAddress,
            testUserAgent
        );

        // Then - Verify URL has all required VNPay parameters
        String[] requiredParams = {
            "vnp_Version=",
            "vnp_Command=",
            "vnp_TmnCode=",
            "vnp_Amount=",
            "vnp_CurrCode=",
            "vnp_TxnRef=",
            "vnp_OrderInfo=",
            "vnp_OrderType=",
            "vnp_Locale=",
            "vnp_ReturnUrl=",
            "vnp_IpAddr=",
            "vnp_CreateDate=",
            "vnp_SecureHash="
        };

        for (String param : requiredParams) {
            assertTrue(paymentUrl.contains(param), 
                "Payment URL should contain required parameter: " + param);
        }
    }
}
