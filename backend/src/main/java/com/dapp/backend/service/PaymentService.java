package com.dapp.backend.service;

import com.dapp.backend.dto.request.PaymentRequest;
import com.dapp.backend.enums.*;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.Booking;
import com.dapp.backend.model.Order;
import com.dapp.backend.repository.AppointmentRepository;
import com.dapp.backend.repository.BookingRepository;
import com.dapp.backend.repository.OrderRepository;
import com.dapp.backend.repository.PaymentRepository;
import com.paypal.base.rest.PayPalRESTException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final AppointmentRepository appointmentRepository;
    private final BookingRepository bookingRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final VnpayService vnpayService;
    private final PaypalService paypalService;
    private final EmailService emailService;

    /**
     * Create VNPay payment URL
     */
    public String createBankUrl(long amount, Long referenceId, Long paymentId, TypeTransactionEnum type, String ipAddress, String userAgent) throws UnsupportedEncodingException {
        return vnpayService.createPaymentUrl(amount, referenceId, paymentId, type, ipAddress, userAgent);
    }

    /**
     * Create PayPal payment URL
     */
    public String createPaypalUrl(Double amount, Long referenceId, Long paymentId, TypeTransactionEnum type, String userAgent) throws PayPalRESTException {
        return paypalService.createPaymentUrl(amount, referenceId, paymentId, type, userAgent);
    }

    /**
     * Handle successful payment
     */
    public void successPayment(PaymentRequest request) throws AppException {
        com.dapp.backend.model.Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new AppException("Payment not found!"));
        
        if (request.getType() == TypeTransactionEnum.ORDER) {
            Order order = orderRepository.findById(Long.parseLong(request.getReferenceId()))
                    .orElseThrow(() -> new AppException("Order not found!"));
            order.setStatus(OrderStatus.PROCESSING);
            payment.setReferenceType(request.getType());
        } else if (request.getType() == TypeTransactionEnum.APPOINTMENT) {
            // referenceId is appointmentId
            Appointment appointment = appointmentRepository.findById(Long.parseLong(request.getReferenceId()))
                    .orElseThrow(() -> new AppException("Appointment not found!"));
            Booking booking = appointment.getBooking();
            booking.setStatus(BookingEnum.CONFIRMED);
            bookingRepository.save(booking);
            payment.setReferenceType(request.getType());
            
            // Send appointment confirmation email
            try {
                var patient = booking.getPatient();
                if (patient != null && patient.getEmail() != null && !patient.getEmail().isEmpty() 
                    && appointment.getScheduledDate() != null && appointment.getCenter() != null) {
                    String timeSlot = appointment.getScheduledTimeSlot() != null 
                        ? appointment.getScheduledTimeSlot().toString() 
                        : "Chưa xác định";
                    emailService.sendAppointmentConfirmation(
                        patient.getEmail(),
                        patient.getFullName(),
                        booking.getVaccine().getName(),
                        appointment.getScheduledDate(),
                        timeSlot,
                        appointment.getCenter().getName(),
                        appointment.getId()
                    );
                }
            } catch (Exception e) {
                // Log but don't fail payment if email fails
                System.err.println("Failed to send confirmation email: " + e.getMessage());
            }
        }
        
        payment.setStatus(PaymentEnum.SUCCESS);
        paymentRepository.save(payment);
    }

    /**
     * Handle cancelled payment
     */
    public void cancelPayment(PaymentRequest request) throws AppException {
        com.dapp.backend.model.Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new AppException("Payment not found!"));
        
        if (request.getType() == TypeTransactionEnum.ORDER) {
            Order order = orderRepository.findById(Long.parseLong(request.getReferenceId()))
                    .orElseThrow(() -> new AppException("Order not found!"));
            order.setStatus(OrderStatus.CANCELLED);
            payment.setReferenceType(request.getType());
        } else if (request.getType() == TypeTransactionEnum.APPOINTMENT) {
            // referenceId is appointmentId
            Appointment appointment = appointmentRepository.findById(Long.parseLong(request.getReferenceId()))
                    .orElseThrow(() -> new AppException("Appointment not found!"));
            Booking booking = appointment.getBooking();
            booking.setStatus(BookingEnum.CANCELLED);
            bookingRepository.save(booking);
            payment.setReferenceType(request.getType());
        }
        
        payment.setStatus(PaymentEnum.FAILED);
        paymentRepository.save(payment);
    }

    /**
     * Update payment status for MetaMask
     */
    public void updatePaymentMetaMask(PaymentRequest request) throws AppException {
        // referenceId is appointmentId
        Appointment appointment = appointmentRepository.findById(Long.parseLong(request.getReferenceId()))
                .orElseThrow(() -> new AppException("Appointment not found!"));
        Booking booking = appointment.getBooking();
        com.dapp.backend.model.Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new AppException("Payment not found!"));
        
        booking.setStatus(BookingEnum.CONFIRMED);
        payment.setStatus(PaymentEnum.SUCCESS);
        bookingRepository.save(booking);
        paymentRepository.save(payment);
        
        // Send appointment confirmation email
        try {
            var patient = booking.getPatient();
            if (patient != null && patient.getEmail() != null && !patient.getEmail().isEmpty() 
                && appointment.getScheduledDate() != null && appointment.getCenter() != null) {
                String timeSlot = appointment.getScheduledTimeSlot() != null 
                    ? appointment.getScheduledTimeSlot().toString() 
                    : "Chưa xác định";
                emailService.sendAppointmentConfirmation(
                    patient.getEmail(),
                    patient.getFullName(),
                    booking.getVaccine().getName(),
                    appointment.getScheduledDate(),
                    timeSlot,
                    appointment.getCenter().getName(),
                    appointment.getId()
                );
            }
        } catch (Exception e) {
            // Log but don't fail payment if email fails
            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }
    }
}
