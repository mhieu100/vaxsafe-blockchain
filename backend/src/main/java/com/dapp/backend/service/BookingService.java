package com.dapp.backend.service;

import com.dapp.backend.dto.response.BookingResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.*;
import com.dapp.backend.repository.*;
import com.dapp.backend.security.JwtUtil;
import com.dapp.backend.util.AppointmentEnum;
import com.dapp.backend.util.BookingEnum;
import com.dapp.backend.util.MethodPaymentEnum;
import com.dapp.backend.util.PaymentEnum;
import com.paypal.api.payments.Links;
import lombok.RequiredArgsConstructor;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.web3j.model.VaccineAppointment;
//import org.web3j.model.VaccineAppointment.Appointment;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

import com.dapp.backend.dto.request.AppointmentRequest;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final UserRepository userRepository;
    private final VaccineRepository vaccineRepository;
    private final CenterRepository centerRepository;
    private final VaccineAppointment contract;
    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentService paymentService;

//    public String createAppointmentWithMetaMark(AppointmentRequest request, String walletAddress) throws Exception {
//        Vaccine vaccine = vaccineRepository.findById(request.getVaccineId()).orElseThrow(() -> new AppException("Vaccine not found!"));
//        Center center = centerRepository.findById(request.getCenterId()).orElseThrow(() -> new AppException("Center not found!"));
//
//        String date = FormatDateTime.convertDateToString(request.getFirstDoseDate());
//        String time = FormatDateTime.convertTimeToString(request.getTime());
//
//        TransactionReceipt receipt = contract.createAppointment(vaccine.getName(), center.getName(), date,
//                time, walletAddress, BigInteger.valueOf(reqAppointment.getPrice())).send();
//        return receipt.getTransactionHash();
//
//    }

        public BookingResponse createBooking(AppointmentRequest request) throws Exception {
            String email = JwtUtil.getCurrentUserLogin().isPresent() ? JwtUtil.getCurrentUserLogin().get() : "";
            User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException("User not found"));
            Vaccine vaccine = vaccineRepository.findById(request.getVaccineId()).orElseThrow(() -> new AppException("Vaccine not found!"));
            Center center = centerRepository.findById(request.getCenterId()).orElseThrow(() -> new AppException("Center not found!"));

            Booking booking = new Booking();
            booking.setUser(user);
            booking.setVaccine(vaccine);
            booking.setCenter(center);
            booking.setTotalAmount(request.getAmount());
            booking.setStatus(BookingEnum.PENDING);


            List<Appointment> appointments = new ArrayList<>();
            Appointment firstDose = new Appointment();
            firstDose.setBooking(booking);
            firstDose.setDoseNumber(1);
            firstDose.setScheduledDate(request.getFirstDoseDate());
            firstDose.setScheduledTime(request.getTime());
            firstDose.setStatus(AppointmentEnum.SCHEDULED);
            appointments.add(firstDose);

            int doseNumber = 1;
            for(AppointmentRequest.DoseSchedule doseSchedule : request.getDoseSchedules()) {
                doseNumber++;
                Appointment dose = new Appointment();
                dose.setBooking(booking);
                dose.setDoseNumber(doseNumber);
                dose.setScheduledDate(doseSchedule.getDate());
                dose.setScheduledTime(doseSchedule.getTime());
                dose.setStatus(AppointmentEnum.SCHEDULED);
                appointments.add(dose);
            }

            booking.setAppointments(appointments);
            bookingRepository.save(booking);

            Payment payment = new Payment();
            payment.setBooking(booking);
            payment.setAmount(request.getAmount());
            payment.setMethod(request.getMethod());
            payment.setCurrency(request.getMethod().getCurrency());
            payment.setStatus(PaymentEnum.INITIATED);
            paymentRepository.save(payment);

            BookingResponse response = new BookingResponse();
            response.setBookingId(booking.getId());
            response.setPaymentId(payment.getId());
            response.setMethod(payment.getMethod());

            switch (request.getMethod()) {
                case PAYPAL:
                    String paypalUrl = paymentService.createPaypalURL(request.getAmount(), response.getBookingId(), response.getPaymentId());
                    response.setPaymentURL(paypalUrl);
                    break;
                case METAMASK:
                    response.setAmount(request.getAmount() / 200000.0);
                    break;
                case CASH:
                    payment.setStatus(PaymentEnum.PROCESSING);
                    paymentRepository.save(payment);
                    booking.setStatus(BookingEnum.CONFIRMED);
                    bookingRepository.save(booking);
                    break;
            }

            return response;
    }




//    public Appointment getAppointment(BigInteger id) throws Exception {
//        return contract.getAppointment(id).send();
//    }
//
//    public List<Appointment> getAllAppointments() throws Exception {
//        return contract.getAllAppointments().send();
//    }
//
//    public List<Appointment> getAppointmentsByDoctor(String doctorAddress) throws Exception {
//        return contract.getAppointmentsByDoctor(doctorAddress).send();
//    }
//
//    public List<Appointment> getAppointmentsByCenter(String centerName) throws Exception {
//        return contract.getAppointmentsByCenter(centerName).send();
//    }
//
//    public List<Appointment> getAppointmentsByPatient(String patientAddress) throws Exception {
//        return contract.getAppointmentsByPatient(patientAddress).send();
//    }
//
//    public String processAppointment(
//            BigInteger appointmentId,
//            String doctorAddress,
//            String cashierAddress) throws Exception {
//        TransactionReceipt receipt = contract.processAppointment(appointmentId, doctorAddress, cashierAddress).send();
//        return "Appointment processed. Transaction hash: " +
//                receipt.getTransactionHash();
//    }
//
//    public String completeAppointment(BigInteger id) throws Exception {
//        TransactionReceipt receipt = contract.completeAppointment(id).send();
//        return "Appointment completed. Transaction hash: " +
//                receipt.getTransactionHash();
//    }
//
//    public String cancelAppointment(String walletAddress,BigInteger id) throws Exception {
//        TransactionReceipt receipt = contract.cancelAppointment(walletAddress, id).send();
//        return "Appointment cancelled. Transaction hash: " +
//                receipt.getTransactionHash();
//    }
//
//    public String refundAppointment(BigInteger id) throws Exception {
//        TransactionReceipt receipt = contract.refundAppointment(id).send();
//        return "Appointment refunded. Transaction hash: " +
//                receipt.getTransactionHash();
//    }
//
//    public String verifyAppointment(Payment payment) throws Exception {
//        payment.setPaymentDateTime(LocalDateTime.now());
//        paymentRepository.save(payment);
//        return "Appointment saved";
//    }
//
//    public Payment verifyAppointment(BigInteger id) throws Exception {
//        return paymentRepository.findById(id.longValue()).get();
//    }
}
