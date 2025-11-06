package com.dapp.backend.service;

import com.dapp.backend.dto.mapper.BookingMapper;
import com.dapp.backend.dto.request.BookingBlcRequest;
import com.dapp.backend.dto.request.BookingRequest;
import com.dapp.backend.dto.response.*;
import com.dapp.backend.enums.*;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.*;
import com.dapp.backend.repository.*;
import com.dapp.backend.util.TokenExtractor;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import static com.dapp.backend.service.PaymentService.EXCHANGE_RATE_TO_USD;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final AuthService authService;
    private final UserRepository userRepository;
    private final VaccineRepository vaccineRepository;
    private final CenterRepository centerRepository;
    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentService paymentService;
    private final FamilyMemberRepository familyMemberRepository;
    private final RestTemplate restTemplate;
    private final TokenExtractor tokenExtractor;
    @Value("${blockchainUrl}")
    private String blockchainUrl;

    public BookingBlcRequest.AppointmentBlcResponse toBookingBlcRequest(Appointment appointment) {
        BookingBlcRequest.AppointmentBlcResponse response = new BookingBlcRequest.AppointmentBlcResponse();
        response.setAppointmentId(appointment.getId());
        response.setDoseNumber(appointment.getDoseNumber());
        response.setScheduledTime(appointment.getScheduledTime());
        response.setScheduledDate(appointment.getScheduledDate());
        response.setAppointmentStatus(appointment.getStatus());
        response.setCenter(appointment.getCenter().getName());
        return response;
    }

    public PaymentResponse createBooking(HttpServletRequest request, BookingRequest bookingRequest) throws Exception {
            User user = authService.getCurrentUserLogin();
            Vaccine vaccine = vaccineRepository.findById(bookingRequest.getVaccineId()).orElseThrow(() -> new AppException("Vaccine not found!"));
            Center center = centerRepository.findById(bookingRequest.getCenterId()).orElseThrow(() -> new AppException("Center not found!"));

            Booking booking = new Booking();
            if (bookingRequest.getFamilyMemberId() != null) {
                FamilyMember familyMember = familyMemberRepository.findById(bookingRequest.getFamilyMemberId()).orElseThrow(() -> new AppException("Family member not found!"));
                booking.setFamilyMember(familyMember);
                booking.setPatient(user);
            } else {
                booking.setPatient(user);
            }
            booking.setVaccine(vaccine);
            booking.setTotalAmount(bookingRequest.getAmount());
            booking.setStatus(BookingEnum.PENDING_PAYMENT);
            booking.setTotalDoses(bookingRequest.getDoseSchedules().size() + 1);

            List<Appointment> appointments = new ArrayList<>();
            Appointment firstDose = new Appointment();
            firstDose.setBooking(booking);
            firstDose.setDoseNumber(1);
            firstDose.setScheduledDate(bookingRequest.getFirstDoseDate());
            firstDose.setScheduledTime(bookingRequest.getFirstDoseTime());
            firstDose.setCenter(center);
            firstDose.setStatus(AppointmentEnum.PENDING_SCHEDULE);
            appointments.add(firstDose);

            int doseNumber = 1;
            for(BookingRequest.DoseSchedule doseSchedule : bookingRequest.getDoseSchedules()) {
                doseNumber++;
                Appointment dose = new Appointment();
                dose.setBooking(booking);
                dose.setDoseNumber(doseNumber);
                dose.setScheduledDate(doseSchedule.getDate());
                dose.setScheduledTime(doseSchedule.getTime());
                dose.setCenter(this.centerRepository.findById(doseSchedule.getCenterId()).orElseThrow(() -> new AppException("Center not found!")));
                dose.setStatus(AppointmentEnum.PENDING_SCHEDULE);
                appointments.add(dose);
            }
            booking.setAppointments(appointments);
            bookingRepository.save(booking);

        BookingBlcRequest bookingBlcRequest = new BookingBlcRequest();
        bookingBlcRequest.setPatient(user.getFullName());
        bookingBlcRequest.setIdentityNumber(user.getPatientProfile().getIdentityNumber());
        bookingBlcRequest.setVaccine(vaccine.getName());
        bookingBlcRequest.setTotalAmount(booking.getTotalAmount());
        bookingBlcRequest.setTotalDoses(booking.getTotalDoses());
        bookingBlcRequest.setBookingStatus(booking.getStatus());

        bookingBlcRequest.setAppointments(booking.getAppointments().stream().map(this::toBookingBlcRequest).toList());

        String token = tokenExtractor.extractToken(request);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " +token);

        HttpEntity<BookingBlcRequest> entity = new HttpEntity<>(bookingBlcRequest, headers);

        ResponseEntity<BookingBlcResponse> response =
                restTemplate.exchange(blockchainUrl+"/bookings/create", HttpMethod.POST, entity, BookingBlcResponse.class);

        if(response.getBody().isSuccess()) {
            booking.setTransactionHash(response.getBody().getTransactionHash());
            bookingRepository.save(booking);
        }

            Payment payment = new Payment();
            payment.setReferenceId(booking.getBookingId());
            payment.setAmount(bookingRequest.getAmount());
            payment.setMethod(bookingRequest.getPaymentMethod());

            if(bookingRequest.getPaymentMethod().toString().equals("PAYPAL")) {
               payment.setAmount(bookingRequest.getAmount() * EXCHANGE_RATE_TO_USD);
            } else if(bookingRequest.getPaymentMethod().toString().equals("METAMASK")){
                payment.setAmount((double) Math.round(bookingRequest.getAmount() / 200000.0));
            } else {
                payment.setAmount(bookingRequest.getAmount());
            }
            payment.setCurrency(bookingRequest.getPaymentMethod().getCurrency());
            payment.setStatus(PaymentEnum.INITIATED);
            paymentRepository.save(payment);

            PaymentResponse paymentResponse = new PaymentResponse();
            paymentResponse.setReferenceId(booking.getBookingId());
            paymentResponse.setPaymentId(payment.getId());
            paymentResponse.setMethod(payment.getMethod());

            switch (bookingRequest.getPaymentMethod()) {
                case PAYPAL:
                    String paypalUrl = paymentService.createPaypalURL(bookingRequest.getAmount(), paymentResponse.getReferenceId(), paymentResponse.getPaymentId(), TypeTransactionEnum.BOOKING);
                    paymentResponse.setPaymentURL(paypalUrl);
                    break;
                case METAMASK:
                    paymentResponse.setAmount(bookingRequest.getAmount() / 200000.0);
                    break;
                case CASH:
                    payment.setStatus(PaymentEnum.PROCESSING);
                    paymentRepository.save(payment);
                    booking.setStatus(BookingEnum.CONFIRMED);
                    bookingRepository.save(booking);
                    break;
            }

            return paymentResponse;
    }

    public List<BookingResponse> getBooking() throws AppException {
        User user = authService.getCurrentUserLogin();
        return bookingRepository.findAllByPatientAndStatus(user, BookingEnum.CONFIRMED).stream()
                .map(BookingMapper::toResponse)
                .toList();
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

    public List<BookingResponse> getHistoryBooking() throws AppException {
        User user = authService.getCurrentUserLogin();
        return bookingRepository.findAllByPatient(user).stream()
                .map(BookingMapper::toResponse)
                .toList();
    }

}
