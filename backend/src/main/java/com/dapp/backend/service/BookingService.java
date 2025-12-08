package com.dapp.backend.service;

import com.dapp.backend.dto.mapper.BookingMapper;
import com.dapp.backend.dto.request.BookingRequest;
import com.dapp.backend.dto.request.WalkInBookingRequest;
import com.dapp.backend.dto.response.*;
import com.dapp.backend.enums.*;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.*;
import com.dapp.backend.repository.*;
import com.dapp.backend.util.TokenExtractor;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import static com.dapp.backend.service.PaypalService.EXCHANGE_RATE_TO_USD;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final AuthService authService;
    private final VaccineRepository vaccineRepository;
    private final CenterRepository centerRepository;
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentService paymentService;
    private final FamilyMemberRepository familyMemberRepository;
    private final TokenExtractor tokenExtractor;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorAvailableSlotRepository slotRepository;
    private final AppointmentRepository appointmentRepository;

    public PaymentResponse createBooking(HttpServletRequest request, BookingRequest bookingRequest) throws Exception {
        User user = authService.getCurrentUserLogin();
        Vaccine vaccine = vaccineRepository.findById(bookingRequest.getVaccineId())
                .orElseThrow(() -> new AppException("Vaccine not found!"));


        Center center = null;
        if (bookingRequest.getAppointmentCenter() != null) {
            center = centerRepository.findById(bookingRequest.getAppointmentCenter())
                    .orElseThrow(() -> new AppException("Center not found!"));


            if (bookingRequest.getAppointmentDate() != null && bookingRequest.getAppointmentTime() != null) {
                TimeSlotEnum requestedSlot = TimeSlotEnum.fromTime(bookingRequest.getAppointmentTime());
                int slotCapacity = center.getCapacity() > 0 ? center.getCapacity() / 6 : 50;


                List<Object[]> bookedCounts = appointmentRepository.countAppointmentsBySlot(center.getCenterId(),
                        bookingRequest.getAppointmentDate());
                int booked = 0;
                for (Object[] row : bookedCounts) {
                    if (row[0] == requestedSlot) {
                        booked = ((Long) row[1]).intValue();
                        break;
                    }
                }

                if (booked >= slotCapacity) {
                    throw new AppException("Selected time slot is full. Please choose another time.");
                }
            }
        }

        Booking booking = new Booking();
        if (bookingRequest.getFamilyMemberId() != null) {
            FamilyMember familyMember = familyMemberRepository.findById(bookingRequest.getFamilyMemberId())
                    .orElseThrow(() -> new AppException("Family member not found!"));
            booking.setFamilyMember(familyMember);
            booking.setPatient(user);
        } else {
            booking.setPatient(user);
        }
        booking.setVaccine(vaccine);
        booking.setTotalAmount(bookingRequest.getAmount());
        booking.setStatus(BookingEnum.PENDING_PAYMENT);

        Integer maxDose = appointmentRepository.findMaxDose(user.getId(), vaccine.getId(),
                bookingRequest.getFamilyMemberId());
        int currentDose = (maxDose == null) ? 1 : maxDose + 1;


        booking.setTotalDoses(1);


        List<Appointment> appointments = new ArrayList<>();
        Appointment appointment = new Appointment();
        appointment.setBooking(booking);
        appointment.setDoseNumber(currentDose);

        appointment.setScheduledDate(bookingRequest.getAppointmentDate());
        if (bookingRequest.getAppointmentTime() != null) {
            appointment.setScheduledTimeSlot(TimeSlotEnum.fromTime(bookingRequest.getAppointmentTime()));
        }
        appointment.setCenter(center);
        appointment.setStatus(AppointmentStatus.PENDING);

        appointments.add(appointment);

        booking.setAppointments(appointments);
        bookingRepository.save(booking);

        String token = tokenExtractor.extractToken(request);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + token);

        bookingRepository.save(booking);


        Appointment firstAppointment = appointments.get(0);
        Payment payment = new Payment();
        payment.setReferenceId(firstAppointment.getId());
        payment.setReferenceType(TypeTransactionEnum.APPOINTMENT);
        payment.setAmount(bookingRequest.getAmount());
        payment.setMethod(bookingRequest.getPaymentMethod());

        switch (bookingRequest.getPaymentMethod().toString()) {
            case "PAYPAL" -> payment.setAmount(bookingRequest.getAmount() * EXCHANGE_RATE_TO_USD);
            case "METAMASK" -> payment.setAmount((double) Math.round(bookingRequest.getAmount() / 200000.0));
            default -> payment.setAmount(bookingRequest.getAmount());
        }
        payment.setCurrency(bookingRequest.getPaymentMethod().getCurrency());
        payment.setStatus(PaymentEnum.INITIATED);
        paymentRepository.save(payment);

        PaymentResponse paymentResponse = new PaymentResponse();
        paymentResponse.setReferenceId(firstAppointment.getId());
        paymentResponse.setPaymentId(payment.getId());
        paymentResponse.setMethod(payment.getMethod());

        switch (bookingRequest.getPaymentMethod()) {
            case BANK:
                String bankUrl = paymentService.createBankUrl(Math.round(bookingRequest.getAmount()),
                        paymentResponse.getReferenceId(), paymentResponse.getPaymentId(),
                        TypeTransactionEnum.APPOINTMENT, request.getRemoteAddr(), request.getHeader("User-Agent"));
                paymentResponse.setPaymentURL(bankUrl);
                break;
            case PAYPAL:
                String paypalUrl = paymentService.createPaypalUrl(bookingRequest.getAmount(),
                        paymentResponse.getReferenceId(), paymentResponse.getPaymentId(),
                        TypeTransactionEnum.APPOINTMENT, request.getHeader("User-Agent"));
                System.out.println(paypalUrl);
                paymentResponse.setPaymentURL(paypalUrl);
                break;
            case METAMASK:
                paymentResponse.setAmount(bookingRequest.getAmount() / 200000.0);
                break;
            case CASH:
                payment.setStatus(PaymentEnum.PROCESSING);
                payment.setReferenceType(TypeTransactionEnum.APPOINTMENT);
                paymentRepository.save(payment);
                booking.setStatus(BookingEnum.CONFIRMED);
                bookingRepository.save(booking);


                try {
                    if (user.getEmail() != null && !user.getEmail().isEmpty()
                            && bookingRequest.getAppointmentDate() != null && center != null) {
                        String timeSlot = bookingRequest.getAppointmentTime() != null
                                ? bookingRequest.getAppointmentTime().toString()
                                : "Chưa xác định";
                        emailService.sendAppointmentConfirmation(
                                user.getEmail(),
                                user.getFullName(),
                                vaccine.getName(),
                                bookingRequest.getAppointmentDate(),
                                timeSlot,
                                center.getName(),
                                firstAppointment.getId());
                    }
                } catch (Exception e) {

                    System.err.println("Failed to send confirmation email: " + e.getMessage());
                }
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

    
    public BookingResponse createWalkInBooking(WalkInBookingRequest request) throws Exception {
        User cashier = authService.getCurrentUserLogin();

        User patient = userRepository.findById(request.getPatientId())
                .orElseThrow(() -> new AppException("Patient not found!"));


        Vaccine vaccine = vaccineRepository.findById(request.getVaccineId())
                .orElseThrow(() -> new AppException("Vaccine not found!"));


        Center center = centerRepository.findById(request.getCenterId())
                .orElseThrow(() -> new AppException("Center not found!"));


        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new AppException("Doctor not found!"));

        if (doctor == null) {
            throw new AppException("User is not a doctor!");
        }


        DoctorAvailableSlot slot = null;
        if (request.getSlotId() != null) {

            slot = slotRepository.findById(request.getSlotId())
                    .orElseThrow(() -> new AppException("Slot not found!"));


            if (slot.getStatus() != SlotStatus.AVAILABLE) {
                throw new AppException("Slot is not available!");
            }
        } else {

            LocalTime startTime = request.getActualScheduledTime();
            LocalTime endTime = startTime.plusMinutes(15);

            slot = slotRepository.findByDoctorIdAndSlotDateAndStartTime(
                    request.getDoctorId(),
                    request.getAppointmentDate(),
                    startTime).orElse(null);

            if (slot == null) {

                slot = new DoctorAvailableSlot();
                slot.setDoctor(doctor);
                slot.setSlotDate(request.getAppointmentDate());
                slot.setStartTime(startTime);
                slot.setEndTime(endTime);
                slot.setStatus(SlotStatus.BOOKED);

                if (request.getNotes() != null && !request.getNotes().isEmpty()) {
                    slot.setNotes(request.getNotes());
                }
                slot = slotRepository.save(slot);
            }
        }


        Booking booking = new Booking();
        if (request.getFamilyMemberId() != null) {
            FamilyMember familyMember = familyMemberRepository.findById(request.getFamilyMemberId())
                    .orElseThrow(() -> new AppException("Family member not found!"));

            if (!familyMember.getUser().getId().equals(patient.getId())) {
                throw new AppException("Family member does not belong to this patient");
            }
            booking.setFamilyMember(familyMember);
        }
        booking.setPatient(patient);
        booking.setVaccine(vaccine);
        booking.setTotalAmount((double) vaccine.getPrice());
        booking.setStatus(BookingEnum.CONFIRMED);

        Integer maxDose = appointmentRepository.findMaxDose(patient.getId(), vaccine.getId(),
                request.getFamilyMemberId());
        int currentDose = (maxDose == null) ? 1 : maxDose + 1;

        booking.setTotalDoses(1);


        List<Appointment> appointments = new ArrayList<>();

        Appointment appointment = new Appointment();
        appointment.setBooking(booking);
        appointment.setDoseNumber(currentDose);


        appointment.setScheduledDate(request.getAppointmentDate());
        appointment.setScheduledTimeSlot(TimeSlotEnum.fromTime(request.getAppointmentTime()));
        appointment.setActualScheduledTime(request.getActualScheduledTime());
        appointment.setCenter(center);
        appointment.setDoctor(doctor.getUser());
        appointment.setCashier(cashier);
        appointment.setSlot(slot);
        appointment.setStatus(AppointmentStatus.SCHEDULED);


        slot.setStatus(SlotStatus.BOOKED);
        slotRepository.save(slot);

        appointments.add(appointment);

        booking.setAppointments(appointments);
        Booking savedBooking = bookingRepository.save(booking);


        Appointment firstAppointment = savedBooking.getAppointments().get(0);
        Payment payment = new Payment();
        payment.setReferenceId(firstAppointment.getId());
        payment.setReferenceType(TypeTransactionEnum.APPOINTMENT);
        payment.setAmount((double) vaccine.getPrice());
        payment.setMethod(request.getPaymentMethod());
        payment.setCurrency(request.getPaymentMethod().getCurrency());
        payment.setStatus(PaymentEnum.PROCESSING);
        paymentRepository.save(payment);
        System.out.println("Walk-in booking created successfully for patient ID: " + patient.getId());

        try {
            if (patient.getEmail() != null && !patient.getEmail().isEmpty()) {


                emailService.sendAppointmentScheduled(
                        patient.getEmail(),
                        patient.getFullName(),
                        vaccine.getName(),
                        request.getAppointmentDate(),
                        request.getAppointmentTime(),
                        center.getName(),
                        center.getAddress(),
                        firstAppointment.getId(),
                        1,
                        cashier.getFullName(),
                        cashier.getPhone() != null ? cashier.getPhone() : "N/A",
                        doctor.getUser().getFullName(),
                        doctor.getUser().getPhone() != null ? doctor.getUser().getPhone() : "N/A");
            }
        } catch (Exception e) {

            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }

        return BookingMapper.toResponse(savedBooking);
    }

    public CenterAvailabilityResponse checkAvailability(Long centerId, LocalDate date) throws AppException {
        Center center = centerRepository.findById(centerId)
                .orElseThrow(() -> new AppException("Center not found"));


        int slotCapacity = center.getCapacity() > 0 ? center.getCapacity() / 6 : 50;


        List<Object[]> bookedCounts = appointmentRepository.countAppointmentsBySlot(centerId, date);

        List<SlotAvailabilityDto> slots = new ArrayList<>();

        for (TimeSlotEnum slotEnum : TimeSlotEnum.values()) {
            int booked = 0;


            for (Object[] row : bookedCounts) {
                if (row[0] == slotEnum) {
                    booked = ((Long) row[1]).intValue();
                    break;
                }
            }

            int available = Math.max(0, slotCapacity - booked);

            slots.add(SlotAvailabilityDto.builder()
                    .timeSlot(slotEnum)
                    .time(slotEnum.getDisplayName())
                    .capacity(slotCapacity)
                    .booked(booked)
                    .available(available)
                    .status(available > 0 ? "AVAILABLE" : "FULL")
                    .build());
        }

        return CenterAvailabilityResponse.builder()
                .date(date)
                .centerId(centerId)
                .slots(slots)
                .build();
    }
}
