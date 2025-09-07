package com.dapp.backend.service;

import com.dapp.backend.dto.request.BookingRequest;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Booking;
import com.dapp.backend.repository.BookingRepository;
import com.dapp.backend.repository.PaymentRepository;
import com.dapp.backend.util.BookingEnum;
import com.dapp.backend.util.PaymentEnum;
import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final APIContext apiContext;
    private static final double EXCHANGE_RATE_TO_USD = 0.000041;

    public String createPaypalURL(Double amount, long bookingId, long paymentId) throws PayPalRESTException {
        Payment payment = createPayment(
                amount * EXCHANGE_RATE_TO_USD,
                "USD",
                "paypal",
                "sale",
                "Payment description",
                "http://localhost:5173/cancel",
                "http://localhost:5173/success?booking="+bookingId+"&payment="+paymentId
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

    public Payment executePayment(String paymentId, String payerId) throws PayPalRESTException {
        Payment payment = new Payment();
        payment.setId(paymentId);
        PaymentExecution execution = new PaymentExecution();
        execution.setPayerId(payerId);
        return payment.execute(apiContext, execution);
    }

    public void updatePaymentPaypal(BookingRequest request) throws AppException {
        Booking booking = bookingRepository.findById(request.getBookingId()).orElseThrow(() -> new AppException("Booking not found!"));
        com.dapp.backend.model.Payment payment = paymentRepository.findById(request.getPaymentId()).orElseThrow(() -> new AppException("Payment not found!"));
        booking.setStatus(BookingEnum.CONFIRMED);
        payment.setStatus(PaymentEnum.SUCCESS);
        bookingRepository.save(booking);
        paymentRepository.save(payment);
    }
}
