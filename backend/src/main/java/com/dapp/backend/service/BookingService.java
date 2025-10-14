package com.dapp.backend.service;

import com.dapp.backend.dto.mapper.BookingMapper;
import com.dapp.backend.dto.request.BookingRequest;
import com.dapp.backend.dto.response.*;
import com.dapp.backend.enums.AppointmentEnum;
import com.dapp.backend.enums.BookingEnum;
import com.dapp.backend.enums.PaymentEnum;
import com.dapp.backend.enums.TypeTransactionEnum;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.*;
import com.dapp.backend.repository.*;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.web3j.model.VaccineAppointment;
//import org.web3j.model.VaccineAppointment.Appointment;

import static com.dapp.backend.service.PaymentService.EXCHANGE_RATE_TO_USD;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final AuthService authService;
    private final UserRepository userRepository;
    private final VaccineRepository vaccineRepository;
    private final CenterRepository centerRepository;
    private final VaccineAppointment contract;
    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentService paymentService;
    private final FamilyMemberRepository familyMemberRepository;


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

        public PaymentResponse createBooking(BookingRequest request) throws Exception {
            User user = authService.getCurrentUserLogin();
            Vaccine vaccine = vaccineRepository.findById(request.getVaccineId()).orElseThrow(() -> new AppException("Vaccine not found!"));
            Center center = centerRepository.findById(request.getCenterId()).orElseThrow(() -> new AppException("Center not found!"));

            Booking booking = new Booking();
            if (request.getFamilyMemberId() != null) {
                FamilyMember familyMember = familyMemberRepository.findById(request.getFamilyMemberId()).orElseThrow(() -> new AppException("Family member not found!"));
                booking.setFamilyMember(familyMember);
            } else {
                booking.setPatient(user);
            }
            booking.setVaccine(vaccine);
            booking.setTotalAmount(request.getAmount());
            booking.setStatus(BookingEnum.PENDING);

            bookingRepository.save(booking);

            List<Appointment> appointments = new ArrayList<>();
            Appointment firstDose = new Appointment();
            firstDose.setBooking(booking);
            firstDose.setDoseNumber(1);
            firstDose.setScheduledDate(request.getFirstDoseDate());
            firstDose.setScheduledTime(request.getFirstDoseTime());
            firstDose.setCenter(center);
            firstDose.setStatus(AppointmentEnum.PENDING);
            appointments.add(firstDose);

            int doseNumber = 1;
            for(BookingRequest.DoseSchedule doseSchedule : request.getDoseSchedules()) {
                doseNumber++;
                Appointment dose = new Appointment();
                dose.setBooking(booking);
                dose.setDoseNumber(doseNumber);
                dose.setScheduledDate(doseSchedule.getDate());
                dose.setScheduledTime(doseSchedule.getTime());
                dose.setCenter(this.centerRepository.findById(doseSchedule.getCenterId()).orElseThrow(() -> new AppException("Center not found!")));
                dose.setStatus(AppointmentEnum.PENDING);
                appointments.add(dose);
            }

            appointmentRepository.saveAll(appointments);
            booking.setAppointments(appointments);

            Payment payment = new Payment();
            payment.setReferenceId(booking.getBookingId());
            payment.setAmount(request.getAmount());
            payment.setMethod(request.getPaymentMethod());

            if(request.getPaymentMethod().toString().equals("PAYPAL")) {
               payment.setAmount(request.getAmount() * EXCHANGE_RATE_TO_USD);
            } else if(request.getPaymentMethod().toString().equals("METAMASK")){
                payment.setAmount((double) Math.round(request.getAmount() / 200000.0));
            } else {
                payment.setAmount(request.getAmount());
            }
            payment.setCurrency(request.getPaymentMethod().getCurrency());
            payment.setStatus(PaymentEnum.INITIATED);
            paymentRepository.save(payment);

            PaymentResponse response = new PaymentResponse();
            response.setReferenceId(booking.getBookingId());
            response.setPaymentId(payment.getId());
            response.setMethod(payment.getMethod());

            switch (request.getPaymentMethod()) {
                case PAYPAL:
                    String paypalUrl = paymentService.createPaypalURL(request.getAmount(), response.getReferenceId(), response.getPaymentId(), TypeTransactionEnum.BOOKING);
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

    public Pagination getAllBookings(Specification<Booking> specification, Pageable pageable) throws Exception {
        Page<Booking> page = bookingRepository.findAll(pageable);
        Pagination pagination = new Pagination();
        Pagination.Meta meta = new Pagination.Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(page.getTotalPages());
        meta.setTotal(page.getTotalElements());

        pagination.setMeta(meta);
        List<Booking> list = page.getContent();

        List<BookingResponse> result = list.stream().map(BookingMapper::toResponse).toList();
        pagination.setResult(result);

        return pagination;
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
