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

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

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

    public PaymentResponse createBooking(HttpServletRequest request, BookingRequest bookingRequest) throws Exception {
        User user = authService.getCurrentUserLogin();
        Vaccine vaccine = vaccineRepository.findById(bookingRequest.getVaccineId())
                .orElseThrow(() -> new AppException("Vaccine not found!"));

        // Get center for first appointment only if provided
        Center center = null;
        if (bookingRequest.getAppointmentCenter() != null) {
            center = centerRepository.findById(bookingRequest.getAppointmentCenter())
                    .orElseThrow(() -> new AppException("Center not found!"));
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
        booking.setTotalDoses(vaccine.getDosesRequired()); // Use vaccine's required doses

        // Create all appointment records based on vaccine's dosesRequired
        List<Appointment> appointments = new ArrayList<>();

        for (int i = 1; i <= vaccine.getDosesRequired(); i++) {
            Appointment appointment = new Appointment();
            appointment.setBooking(booking);
            appointment.setDoseNumber(i);

            // Only first appointment has date/time/center
            if (i == 1) {
                appointment.setScheduledDate(bookingRequest.getAppointmentDate());
                if (bookingRequest.getAppointmentTime() != null) {
                    appointment.setScheduledTimeSlot(TimeSlotEnum.fromTime(bookingRequest.getAppointmentTime()));
                }
                appointment.setCenter(center);
                appointment.setStatus(AppointmentStatus.PENDING);
            } else {
                // Subsequent appointments: leave date/time/center null
                appointment.setScheduledDate(null);
                appointment.setScheduledTimeSlot(null);
                appointment.setCenter(null);
                appointment.setStatus(AppointmentStatus.PENDING);
            }

            appointments.add(appointment);
        }

        booking.setAppointments(appointments);
        bookingRepository.save(booking);

        String token = tokenExtractor.extractToken(request);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + token);

        bookingRepository.save(booking);

        // Payment links to first appointment (dose 1)
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
                
                // Send appointment confirmation email for CASH payment
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
                            firstAppointment.getId()
                        );
                    }
                } catch (Exception e) {
                    // Log but don't fail booking if email fails
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

    /**
     * Create walk-in booking with direct doctor assignment
     * Bypasses PENDING status - goes straight to SCHEDULED
     */
    public BookingResponse createWalkInBooking(WalkInBookingRequest request) throws Exception {
        User cashier = authService.getCurrentUserLogin();
        // Validate patient
        User patient = userRepository.findById(request.getPatientId())
                .orElseThrow(() -> new AppException("Patient not found!"));
        
        // Validate vaccine
        Vaccine vaccine = vaccineRepository.findById(request.getVaccineId())
                .orElseThrow(() -> new AppException("Vaccine not found!"));
        
        // Validate center
        Center center = centerRepository.findById(request.getCenterId())
                .orElseThrow(() -> new AppException("Center not found!"));
        
        // Validate doctor user
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new AppException("Doctor not found!"));
        
        
        if (doctor == null) {
            throw new AppException("User is not a doctor!");
        }
        
        // Handle slot (create if virtual, use existing if real)
        DoctorAvailableSlot slot = null;
        if (request.getSlotId() != null) {
            // Real slot - get from database
            slot = slotRepository.findById(request.getSlotId())
                    .orElseThrow(() -> new AppException("Slot not found!"));
            
            // Check if slot is available
            if (slot.getStatus() != SlotStatus.AVAILABLE) {
                throw new AppException("Slot is not available!");
            }
        } else {
            // Virtual slot - check if already exists, if not create new
            LocalTime startTime = request.getActualScheduledTime();
            LocalTime endTime = startTime.plusMinutes(15);
            
            slot = slotRepository.findByDoctorIdAndSlotDateAndStartTime(
                    request.getDoctorId(),
                    request.getAppointmentDate(),
                    startTime
            ).orElse(null);
            
            if (slot == null) {
                // Create new virtual slot
                slot = new DoctorAvailableSlot();
                slot.setDoctor(doctor);
                slot.setSlotDate(request.getAppointmentDate());
                slot.setStartTime(startTime);
                slot.setEndTime(endTime);
                slot.setStatus(SlotStatus.BOOKED);
                // Store notes in slot if provided
                if (request.getNotes() != null && !request.getNotes().isEmpty()) {
                    slot.setNotes(request.getNotes());
                }
                slot = slotRepository.save(slot);
            }
        }
        
        // Create booking
        Booking booking = new Booking();
        booking.setPatient(patient);
        booking.setVaccine(vaccine);
        booking.setTotalAmount((double) vaccine.getPrice());
        booking.setStatus(BookingEnum.CONFIRMED); // Walk-in is confirmed immediately
        booking.setTotalDoses(vaccine.getDosesRequired());
        
        // Create appointments
        List<Appointment> appointments = new ArrayList<>();
        
        for (int i = 1; i <= vaccine.getDosesRequired(); i++) {
            Appointment appointment = new Appointment();
            appointment.setBooking(booking);
            appointment.setDoseNumber(i);
            
            if (i == 1) {
                // First dose - assign immediately
                appointment.setScheduledDate(request.getAppointmentDate());
                appointment.setScheduledTimeSlot(TimeSlotEnum.fromTime(request.getAppointmentTime()));
                appointment.setActualScheduledTime(request.getActualScheduledTime());
                appointment.setCenter(center);
                appointment.setDoctor(doctor.getUser()); // Use User entity here
                appointment.setSlot(slot);
                appointment.setStatus(AppointmentStatus.SCHEDULED); // Skip PENDING
                
                // Mark slot as booked
                slot.setStatus(SlotStatus.BOOKED);
                slotRepository.save(slot);
            } else {
                // Subsequent doses - leave unscheduled
                appointment.setScheduledDate(null);
                appointment.setScheduledTimeSlot(null);
                appointment.setCenter(null);
                appointment.setStatus(AppointmentStatus.PENDING);
            }
            
            appointments.add(appointment);
        }
        
        booking.setAppointments(appointments);
        Booking savedBooking = bookingRepository.save(booking);
        
        // Create payment record (after booking is saved so appointment has ID)
        Appointment firstAppointment = savedBooking.getAppointments().get(0);
        Payment payment = new Payment();
        payment.setReferenceId(firstAppointment.getId());
        payment.setReferenceType(TypeTransactionEnum.APPOINTMENT);
        payment.setAmount((double) vaccine.getPrice());
        payment.setMethod(request.getPaymentMethod());
        payment.setCurrency(request.getPaymentMethod().getCurrency());
        payment.setStatus(PaymentEnum.PROCESSING); // Walk-in payment is processing
        paymentRepository.save(payment);
        System.out.println("Walk-in booking created successfully for patient ID: " + patient.getId());
        // Send confirmation email
        try {
            if (patient.getEmail() != null && !patient.getEmail().isEmpty()) {
                // Use sendAppointmentScheduled for walk-in bookings (already has doctor assigned)
                emailService.sendAppointmentScheduled(
                    patient.getEmail(),
                    patient.getFullName(),
                    vaccine.getName(),
                    request.getAppointmentDate(),
                    request.getAppointmentTime(),
                    center.getName(),
                    center.getAddress(),
                    firstAppointment.getId(),
                    1, // First dose
                    cashier.getFullName(), // Cashier is the one creating walk-in booking
                    cashier.getPhone() != null ? cashier.getPhone() : "N/A",
                    doctor.getUser().getFullName(),
                    doctor.getUser().getPhone() != null ? doctor.getUser().getPhone() : "N/A"
                );
            }
        } catch (Exception e) {
            // Log but don't fail booking if email fails
            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }
        
        return BookingMapper.toResponse(savedBooking);
    }

}
