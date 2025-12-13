package com.dapp.backend.service;

import com.dapp.backend.dto.request.PaymentRequest;
import com.dapp.backend.enums.OrderStatus;
import com.dapp.backend.enums.PaymentEnum;
import com.dapp.backend.enums.TypeTransactionEnum;
import com.dapp.backend.enums.AppointmentStatus;
import com.dapp.backend.dto.response.TransactionResultResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.Order;
import com.dapp.backend.model.Payment;
import com.dapp.backend.repository.AppointmentRepository;
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
        private final OrderRepository orderRepository;
        private final PaymentRepository paymentRepository;
        private final VnpayService vnpayService;
        private final PaypalService paypalService;
        private final EmailService emailService;

        public String createBankUrl(long amount, Long referenceId, Long paymentId, TypeTransactionEnum type,
                        String ipAddress, String userAgent) throws UnsupportedEncodingException {
                return vnpayService.createPaymentUrl(amount, referenceId, paymentId, type, ipAddress, userAgent);
        }

        public String createPaypalUrl(Double amount, Long referenceId, Long paymentId, TypeTransactionEnum type,
                        String userAgent) throws PayPalRESTException {
                return paypalService.createPaymentUrl(amount, referenceId, paymentId, type, userAgent);
        }

        public void successPayment(PaymentRequest request) throws AppException {
                Payment payment = paymentRepository.findById(request.getPaymentId())
                                .orElseThrow(() -> new AppException("Payment not found!"));

                if (request.getType() == TypeTransactionEnum.ORDER) {
                        Order order = orderRepository.findById(Long.parseLong(request.getReferenceId()))
                                        .orElseThrow(() -> new AppException("Order not found!"));
                        order.setStatus(OrderStatus.PROCESSING);
                        payment.setReferenceType(request.getType());
                } else if (request.getType() == TypeTransactionEnum.APPOINTMENT) {

                        Appointment appointment = appointmentRepository
                                        .findById(Long.parseLong(request.getReferenceId()))
                                        .orElseThrow(() -> new AppException("Appointment not found!"));

                        // Payment Success -> Transition from INITIAL to PENDING (Confirmed Paid)
                        if (appointment.getStatus() == AppointmentStatus.INITIAL) {
                                appointment.setStatus(AppointmentStatus.PENDING);
                                appointmentRepository.save(appointment);
                        }

                        payment.setReferenceType(request.getType());

                        try {
                                var patient = appointment.getPatient();
                                if (patient != null && patient.getEmail() != null && !patient.getEmail().isEmpty()
                                                && appointment.getScheduledDate() != null
                                                && appointment.getCenter() != null) {
                                        String timeSlot = appointment.getScheduledTimeSlot() != null
                                                        ? appointment.getScheduledTimeSlot().toString()
                                                        : "Chưa xác định";
                                        emailService.sendAppointmentConfirmation(
                                                        patient.getEmail(),
                                                        patient.getFullName(),
                                                        appointment.getVaccine().getName(),
                                                        appointment.getScheduledDate(),
                                                        timeSlot,
                                                        appointment.getCenter().getName(),
                                                        appointment.getId());
                                }
                        } catch (Exception e) {

                                System.err.println("Failed to send confirmation email: " + e.getMessage());
                        }
                }

                payment.setStatus(PaymentEnum.SUCCESS);
                paymentRepository.save(payment);
        }

        public void cancelPayment(PaymentRequest request) throws AppException {
                Payment payment = paymentRepository.findById(request.getPaymentId())
                                .orElseThrow(() -> new AppException("Payment not found!"));

                if (request.getType() == TypeTransactionEnum.ORDER) {
                        Order order = orderRepository.findById(Long.parseLong(request.getReferenceId()))
                                        .orElseThrow(() -> new AppException("Order not found!"));
                        order.setStatus(OrderStatus.CANCELLED);
                        payment.setReferenceType(request.getType());
                } else if (request.getType() == TypeTransactionEnum.APPOINTMENT) {

                        Appointment appointment = appointmentRepository
                                        .findById(Long.parseLong(request.getReferenceId()))
                                        .orElseThrow(() -> new AppException("Appointment not found!"));
                        appointment.setStatus(AppointmentStatus.CANCELLED);
                        appointmentRepository.save(appointment);
                        payment.setReferenceType(request.getType());
                }

                payment.setStatus(PaymentEnum.FAILED);
                paymentRepository.save(payment);
        }

        public void updatePaymentMetaMask(PaymentRequest request) throws AppException {

                Appointment appointment = appointmentRepository.findById(Long.parseLong(request.getReferenceId()))
                                .orElseThrow(() -> new AppException("Appointment not found!"));
                Payment payment = paymentRepository.findById(request.getPaymentId())
                                .orElseThrow(() -> new AppException("Payment not found!"));

                appointment.setStatus(AppointmentStatus.SCHEDULED);
                payment.setStatus(PaymentEnum.SUCCESS);
                appointmentRepository.save(appointment);
                paymentRepository.save(payment);

                try {
                        var patient = appointment.getPatient();
                        if (patient != null && patient.getEmail() != null && !patient.getEmail().isEmpty()
                                        && appointment.getScheduledDate() != null && appointment.getCenter() != null) {
                                String timeSlot = appointment.getScheduledTimeSlot() != null
                                                ? appointment.getScheduledTimeSlot().toString()
                                                : "Chưa xác định";
                                emailService.sendAppointmentConfirmation(
                                                patient.getEmail(),
                                                patient.getFullName(),
                                                appointment.getVaccine().getName(),
                                                appointment.getScheduledDate(),
                                                timeSlot,
                                                appointment.getCenter().getName(),
                                                appointment.getId());
                        }
                } catch (Exception e) {

                        System.err.println("Failed to send confirmation email: " + e.getMessage());
                }
        }

        public TransactionResultResponse getTransactionResult(Long paymentId)
                        throws AppException {
                Payment payment = paymentRepository.findById(paymentId)
                                .orElseThrow(() -> new AppException("Payment not found!"));

                TransactionResultResponse.TransactionResultResponseBuilder builder = TransactionResultResponse
                                .builder()
                                .status(payment.getStatus().name())
                                .referenceType(payment.getReferenceType().name())
                                .amount(payment.getAmount())
                                .transactionId(String.valueOf(payment.getId()));

                if (payment.getReferenceType() == TypeTransactionEnum.APPOINTMENT) {
                        Appointment appointment = appointmentRepository.findById(payment.getReferenceId())
                                        .orElseThrow(() -> new AppException("Appointment not found!"));

                        builder.vaccineName(
                                        appointment.getVaccine() != null ? appointment.getVaccine().getName() : "N/A")
                                        .centerName(appointment.getCenter() != null ? appointment.getCenter().getName()
                                                        : "N/A")
                                        .scheduledDate(appointment.getScheduledDate())
                                        .scheduledTime(
                                                        appointment.getScheduledTimeSlot() != null
                                                                        ? appointment.getScheduledTimeSlot().toString()
                                                                        : "")
                                        .patientName(appointment.getPatient().getFullName())
                                        .emailSentTo(appointment.getPatient().getEmail());
                } else if (payment.getReferenceType() == TypeTransactionEnum.ORDER) {
                        Order order = orderRepository.findById(payment.getReferenceId())
                                        .orElseThrow(() -> new AppException("Order not found!"));
                        // Populate order details if needed
                        if (order.getUser() != null) {
                                builder.patientName(order.getUser().getFullName())
                                                .emailSentTo(order.getUser().getEmail());
                        }
                }

                return builder.build();
        }
}
