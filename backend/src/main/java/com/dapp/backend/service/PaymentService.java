package com.dapp.backend.service;

import com.dapp.backend.dto.request.PaymentRequest;
import com.dapp.backend.enums.*;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Booking;
import com.dapp.backend.repository.BookingRepository;
import com.dapp.backend.repository.OrderRepository;
import com.dapp.backend.repository.PaymentRepository;
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
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final APIContext apiContext;
    public static final double EXCHANGE_RATE_TO_USD = 0.000041;

    public String createPaypalURL(Double amount, Long referenceId, Long paymentId, TypeTransactionEnum type) throws PayPalRESTException {
        Payment payment = createPayment(
                amount * EXCHANGE_RATE_TO_USD,
                "USD",
                "paypal",
                "sale",
                "Payment description",
                "http://localhost:3000/cancel?referenceId="+referenceId+"&type="+type+"&payment="+paymentId,
                "http://localhost:3000/success?referenceId="+referenceId+"&type="+type+"&payment="+paymentId
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

    public void updatePaymentPaypal(PaymentRequest request) throws AppException {
        com.dapp.backend.model.Payment payment = paymentRepository.findById(request.getPaymentId()).orElseThrow(() -> new AppException("Payment not found!"));
        if(request.getType() == TypeTransactionEnum.ORDER) {
            com.dapp.backend.model.Order order = orderRepository.findById(Long.parseLong(request.getReferenceId())).orElseThrow(() -> new AppException("Order not found!"));
            order.setStatus(OrderStatus.PROCESSING);
        } else {
            Booking booking = bookingRepository.findById(Long.parseLong(request.getReferenceId())).orElseThrow(() -> new AppException("Booking not found!"));
            booking.setStatus(BookingEnum.CONFIRMED);
            booking.getAppointments().get(0).setStatus(AppointmentEnum.AWAITING_CHECKIN);
            bookingRepository.save(booking);
        }
        payment.setStatus(PaymentEnum.SUCCESS);
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
