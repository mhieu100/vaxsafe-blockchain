package com.dapp.backend.service;

import com.dapp.backend.dto.mapper.AppointmentMapper;
import com.dapp.backend.dto.mapper.UserMapper;
import com.dapp.backend.dto.request.BookingRequest;
import com.dapp.backend.dto.request.CompleteAppointmentRequest;
import com.dapp.backend.dto.request.NextDoseBookingRequest;
import com.dapp.backend.dto.request.ProcessAppointmentRequest;
import com.dapp.backend.dto.request.RescheduleAppointmentRequest;
import com.dapp.backend.dto.request.WalkInBookingRequest;
import com.dapp.backend.dto.response.*;
import com.dapp.backend.enums.*;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.*;
import com.dapp.backend.repository.*;
import com.dapp.backend.service.spec.AppointmentSpecifications;
import com.dapp.backend.util.TokenExtractor;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.dapp.backend.service.PaypalService.EXCHANGE_RATE_TO_USD;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AuthService authService;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorAvailableSlotRepository slotRepository;
    private final TokenExtractor tokenExtractor;
    private final PaymentRepository paymentRepository;
    private final VaccineRecordService vaccineRecordService;
    private final VaccinationReminderService reminderService;
    private final NextDoseReminderService nextDoseReminderService;
    private final EmailService emailService;
    private final PaymentService paymentService;
    private final VaccineRepository vaccineRepository;
    private final CenterRepository centerRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final UserRepository userRepository;
    private final VaccinationCourseRepository vaccinationCourseRepository;
    private final PatientRepository patientRepository;

    public Pagination getAllAppointmentOfCenter(Specification<Appointment> specification, Pageable pageable)
            throws AppException {
        User user = authService.getCurrentUserLogin();
        Center center = UserMapper.getCenter(user);

        if (center == null) {
            throw new AppException("User is not associated with any center.");
        }

        Specification<Appointment> centerSpec = AppointmentSpecifications.findByCenter(center.getName());
        specification = Specification.where(specification).and(centerSpec);

        Page<Appointment> page = appointmentRepository.findAll(specification, pageable);
        Pagination pagination = new Pagination();
        Pagination.Meta meta = new Pagination.Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(page.getTotalPages());
        meta.setTotal(page.getTotalElements());

        pagination.setMeta(meta);
        List<Appointment> list = page.getContent();
        List<AppointmentResponse> result = list.stream()
                .map(apt -> {
                    AppointmentResponse response = AppointmentMapper.toResponse(apt);

                    paymentRepository.findByAppointmentId(apt.getId(), TypeTransactionEnum.APPOINTMENT)
                            .ifPresent(payment -> {
                                response.setPaymentId(payment.getId());
                                response.setPaymentStatus(
                                        payment.getStatus() != null ? payment.getStatus().name() : null);
                                response.setPaymentMethod(
                                        payment.getMethod() != null ? payment.getMethod().name() : null);
                                response.setPaymentAmount(payment.getAmount());
                            });
                    return response;
                })
                .toList();
        pagination.setResult(result);
        return pagination;
    }

    public Pagination getAllAppointmentsOfDoctor(Specification<Appointment> specification, Pageable pageable)
            throws AppException {
        User user = authService.getCurrentUserLogin();
        specification = Specification.where(specification)
                .and(AppointmentSpecifications.findByDoctor(user.getFullName()));
        Page<Appointment> page = appointmentRepository.findAll(specification, pageable);
        Pagination pagination = new Pagination();
        Pagination.Meta meta = new Pagination.Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(page.getTotalPages());
        meta.setTotal(page.getTotalElements());
        pagination.setMeta(meta);
        List<Appointment> list = page.getContent();
        List<AppointmentResponse> result = list.stream()
                .map(apt -> {
                    AppointmentResponse response = AppointmentMapper.toResponse(apt);

                    paymentRepository.findByAppointmentId(apt.getId(), TypeTransactionEnum.APPOINTMENT)
                            .ifPresent(payment -> {
                                response.setPaymentId(payment.getId());
                                response.setPaymentStatus(
                                        payment.getStatus() != null ? payment.getStatus().name() : null);
                                response.setPaymentMethod(
                                        payment.getMethod() != null ? payment.getMethod().name() : null);
                                response.setPaymentAmount(payment.getAmount());
                            });
                    return response;
                })
                .toList();
        pagination.setResult(result);
        return pagination;
    }

    public AppointmentResponse updateScheduledAppointment(HttpServletRequest request,
            ProcessAppointmentRequest processAppointmentRequest) throws Exception {
        User cashier = authService.getCurrentUserLogin();
        Appointment appointment = appointmentRepository.findById(processAppointmentRequest.getAppointmentId())
                .orElseThrow(() -> new AppException("Appointment not found"));

        Doctor doctorEntity = doctorRepository.findById(processAppointmentRequest.getDoctorId())
                .orElseThrow(
                        () -> new AppException("Doctor not found with id: " + processAppointmentRequest.getDoctorId()));
        User doctor = doctorEntity.getUser();

        if (appointment.getSlot() != null) {
            DoctorAvailableSlot oldSlot = appointment.getSlot();

            if (processAppointmentRequest.getSlotId() == null
                    || !oldSlot.getSlotId().equals(processAppointmentRequest.getSlotId())) {
                oldSlot.setStatus(SlotStatus.AVAILABLE);
                oldSlot.setAppointment(null);
                slotRepository.save(oldSlot);
            }
        }

        DoctorAvailableSlot slot = null;
        if (processAppointmentRequest.getSlotId() != null) {

            slot = slotRepository.findById(processAppointmentRequest.getSlotId())
                    .orElseThrow(
                            () -> new AppException("Slot not found with id: " + processAppointmentRequest.getSlotId()));

            if (slot.getStatus() != SlotStatus.AVAILABLE
                    && (slot.getAppointment() != null && !slot.getAppointment().getId().equals(appointment.getId()))) {
                throw new AppException("Slot is not available");
            }

            slot.setStatus(SlotStatus.BOOKED);
            slot.setAppointment(appointment);
            slotRepository.save(slot);
        } else if (processAppointmentRequest.getActualScheduledTime() != null) {

            LocalTime startTime = processAppointmentRequest.getActualScheduledTime();
            LocalTime endTime = startTime.plusMinutes(15);
            LocalDate slotDate = appointment.getScheduledDate();

            slot = slotRepository.findByDoctorIdAndSlotDateAndStartTime(
                    processAppointmentRequest.getDoctorId(),
                    slotDate,
                    startTime).orElse(null);

            if (slot != null && slot.getStatus() != SlotStatus.AVAILABLE
                    && (slot.getAppointment() != null && !slot.getAppointment().getId().equals(appointment.getId()))) {
                throw new AppException("This time slot is already booked for this doctor");
            }

            if (slot == null) {

                slot = new DoctorAvailableSlot();
                slot.setDoctor(doctorEntity);
                slot.setSlotDate(slotDate);
                slot.setStartTime(startTime);
                slot.setEndTime(endTime);
            }

            slot.setStatus(SlotStatus.BOOKED);
            slot.setAppointment(appointment);
            slot = slotRepository.save(slot);

            log.info("Created virtual slot: doctorId={}, date={}, time={}-{}",
                    doctorEntity.getUser().getId(), slotDate, startTime, endTime);
        } else {
            throw new AppException("Either slotId or actualScheduledTime must be provided");
        }

        if (appointment.getStatus() == AppointmentStatus.RESCHEDULE) {
            if (appointment.getDesiredDate() != null) {
                appointment.setScheduledDate(appointment.getDesiredDate());
            }
            if (appointment.getDesiredTimeSlot() != null) {
                appointment.setScheduledTimeSlot(appointment.getDesiredTimeSlot());
            }

        }

        if (processAppointmentRequest.getActualScheduledTime() != null) {
            appointment.setActualScheduledTime(processAppointmentRequest.getActualScheduledTime());
        }

        appointment.setDoctor(doctor);
        appointment.setCashier(cashier);
        appointment.setSlot(slot);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        try {
            reminderService.cancelRemindersForAppointment(savedAppointment.getId());
            reminderService.createRemindersForAppointment(savedAppointment);
            log.info("Created reminders for appointment ID: {}", savedAppointment.getId());
        } catch (Exception e) {
            log.error("Failed to create reminders for appointment ID: {}", savedAppointment.getId(), e);

        }

        try {
            User patient = savedAppointment.getPatient();
            if (patient != null && patient.getEmail() != null && !patient.getEmail().isEmpty()) {
                String centerAddress = savedAppointment.getCenter().getAddress() != null
                        ? savedAppointment.getCenter().getAddress()
                        : "";
                String cashierName = cashier.getFullName() != null ? cashier.getFullName() : "Chưa xác định";
                String cashierPhone = cashier.getPhone() != null ? cashier.getPhone() : "";
                String doctorName = doctor.getFullName() != null ? "BS. " + doctor.getFullName() : "Chưa xác định";
                String doctorPhone = doctor.getPhone() != null ? doctor.getPhone() : "";

                String timeSlotString = slot.getStartTime() + " - " + slot.getEndTime();

                emailService.sendAppointmentScheduled(
                        patient.getEmail(),
                        patient.getFullName(),
                        savedAppointment.getVaccine().getName(),
                        savedAppointment.getScheduledDate(),
                        timeSlotString,
                        savedAppointment.getCenter().getName(),
                        centerAddress,
                        savedAppointment.getId(),
                        savedAppointment.getDoseNumber(),
                        cashierName,
                        cashierPhone,
                        doctorName,
                        doctorPhone);
                log.info("Sent appointment scheduled email to: {}", patient.getEmail());
            }
        } catch (Exception e) {
            log.error("Failed to send appointment scheduled email for appointment ID: {}", savedAppointment.getId(), e);

        }

        AppointmentResponse response = AppointmentMapper.toResponse(savedAppointment);

        paymentRepository.findByAppointmentId(appointment.getId(), TypeTransactionEnum.APPOINTMENT)
                .ifPresent(payment -> {
                    response.setPaymentId(payment.getId());
                    response.setPaymentStatus(payment.getStatus() != null ? payment.getStatus().name() : null);
                    response.setPaymentMethod(payment.getMethod() != null ? payment.getMethod().name() : null);
                    response.setPaymentAmount(payment.getAmount());
                });
        return response;
    }

    public String complete(HttpServletRequest request, long id,
            CompleteAppointmentRequest completeRequest) throws AppException {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppException("Appointment not found " + id));

        if (appointment.getVaccinationDate() == null) {
            appointment.setVaccinationDate(LocalDate.now());
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        if (appointment.getVaccinationCourse() != null) {
            VaccinationCourse course = appointment.getVaccinationCourse();
            course.setCurrentDoseIndex(appointment.getDoseNumber());

            if (appointment.getDoseNumber() >= appointment.getVaccine().getDosesRequired()) {
                course.setStatus(VaccinationCourseStatus.COMPLETED);
                course.setEndDate(LocalDateTime.now());
            }
            vaccinationCourseRepository.save(course);
        }

        // Update patient health metrics if it's a self-appointment
        if (appointment.getFamilyMember() == null && appointment.getPatient() != null) {
            User user = appointment.getPatient();
            Patient patientProfile = user.getPatientProfile();
            if (patientProfile != null) {
                boolean updated = false;
                if (completeRequest.getHeight() != null) {
                    patientProfile.setHeightCm(completeRequest.getHeight());
                    updated = true;
                }
                if (completeRequest.getWeight() != null) {
                    patientProfile.setWeightKg(completeRequest.getWeight());
                    updated = true;
                }
                if (updated) {
                    patientRepository.save(patientProfile);
                    log.info("Updated health metrics for patient {}", user.getId());
                }
            }
        } else if (appointment.getFamilyMember() != null) {
            FamilyMember member = appointment.getFamilyMember();
            boolean updated = false;
            if (completeRequest.getHeight() != null) {
                member.setHeightCm(completeRequest.getHeight());
                updated = true;
            }
            if (completeRequest.getWeight() != null) {
                member.setWeightKg(completeRequest.getWeight());
                updated = true;
            }
            if (updated) {
                familyMemberRepository.save(member);
                log.info("Updated health metrics for family member {}", member.getId());
            }
        }

        try {
            vaccineRecordService.createFromAppointment(appointment, completeRequest);
            log.info("Vaccine record created for appointment {}", id);
        } catch (Exception e) {
            log.error("Failed to create vaccine record for appointment {}", id, e);

        }

        try {
            nextDoseReminderService.createNextDoseReminder(appointment);
            log.info("Next dose reminder created for appointment {}", id);
        } catch (Exception e) {
            log.error("Failed to create next dose reminder for appointment {}", id, e);

        }

        String token = tokenExtractor.extractToken(request);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + token);

        return "Appointment update success";
    }

    @Transactional(rollbackFor = Exception.class)
    public String cancel(HttpServletRequest request, long id) throws AppException {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppException("Appointment not found " + id));

        if (appointment.getSlot() != null) {
            DoctorAvailableSlot slot = appointment.getSlot();
            slot.setAppointment(null);
            slot.setStatus(SlotStatus.AVAILABLE);
            slotRepository.save(slot);
            log.info("Released doctor slot ID: {} for cancelled appointment ID: {}", slot.getSlotId(), id);
        }

        if (appointment.getStatus() != AppointmentStatus.CANCELLED
                && appointment.getStatus() != AppointmentStatus.COMPLETED) {
            Vaccine vaccine = appointment.getVaccine();
            if (vaccine != null) {
                vaccine.setStock(vaccine.getStock() + 1);
                vaccineRepository.save(vaccine);
            }
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);

        try {
            User patient = appointment.getPatient();
            if (patient != null && patient.getEmail() != null) {
                emailService.sendAppointmentCancellation(
                        patient.getEmail(),
                        patient.getFullName(),
                        appointment.getVaccine().getName(),
                        appointment.getScheduledDate(),
                        "Bạn đã yêu cầu hủy lịch hẹn");
                log.info("Sent cancellation email to: {}", patient.getEmail());
            }
        } catch (Exception e) {
            log.error("Failed to send cancellation email for appointment ID: {}", id, e);
        }

        // String token = tokenExtractor.extractToken(request);
        // HttpHeaders headers = new HttpHeaders();
        // headers.setContentType(MediaType.APPLICATION_JSON);
        // headers.set("Authorization", "Bearer " + token);

        return "Appointment update success";
    }

    @Transactional
    public RescheduleAppointmentResponse rescheduleAppointment(RescheduleAppointmentRequest request)
            throws AppException {

        User currentUser = authService.getCurrentUserLogin();

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new AppException("Appointment not found"));

        boolean isOwner = false;

        if (appointment.getPatient() != null && appointment.getPatient().getId().equals(currentUser.getId())) {
            isOwner = true;
        } else if (appointment.getFamilyMember() != null &&
                appointment.getFamilyMember().getUser().getId().equals(currentUser.getId())) {
            isOwner = true;
        }

        if (!isOwner) {
            throw new AppException("You can only reschedule your own appointments");
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new AppException("Cannot reschedule completed appointments");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new AppException("Cannot reschedule cancelled appointments");
        }

        LocalDate oldDate = appointment.getScheduledDate();
        TimeSlotEnum oldTimeSlot = appointment.getScheduledTimeSlot();

        appointment.setDesiredDate(request.getDesiredDate());
        appointment.setDesiredTimeSlot(request.getDesiredTimeSlot());

        appointment.setRescheduledAt(LocalDateTime.now());

        appointment.setStatus(AppointmentStatus.RESCHEDULE);

        appointmentRepository.save(appointment);

        return RescheduleAppointmentResponse.builder()
                .appointmentId(appointment.getId())
                .oldDate(oldDate)
                .oldTimeSlot(oldTimeSlot)
                .newDate(request.getDesiredDate())
                .newTimeSlot(request.getDesiredTimeSlot())
                .status(AppointmentStatus.RESCHEDULE)
                .message(
                        "Reschedule request submitted successfully. Waiting for cashier approval and doctor reassignment.")
                .build();
    }

    public List<UrgentAppointmentDto> getUrgentAppointments() throws AppException {
        User currentUser = authService.getCurrentUserLogin();
        Center center = UserMapper.getCenter(currentUser);

        if (center == null) {
            throw new AppException("User is not associated with any center.");
        }

        List<UrgentAppointmentDto> urgentAppointments = new java.util.ArrayList<>();
        LocalDate today = LocalDate.now();

        List<Appointment> rescheduleRequests = appointmentRepository
                .findByStatusAndDesiredDateIsNotNullAndCenter(AppointmentStatus.RESCHEDULE, center);

        for (Appointment apt : rescheduleRequests) {
            urgentAppointments.add(buildUrgentDto(apt, "RESCHEDULE_PENDING",
                    "Yêu cầu đổi lịch chờ phê duyệt", 1));
        }

        List<Appointment> noDoctorAppointments = appointmentRepository
                .findAppointmentsWithoutDoctor(
                        List.of(AppointmentStatus.SCHEDULED, AppointmentStatus.PENDING),
                        today,
                        today.plusDays(2),
                        center);

        for (Appointment apt : noDoctorAppointments) {

            urgentAppointments.add(buildUrgentDto(apt, "NO_DOCTOR",
                    "KHẨN CẤP: Chưa có bác sĩ", 1));
        }

        urgentAppointments.sort(java.util.Comparator.comparingInt(
                UrgentAppointmentDto::getPriorityLevel));

        return urgentAppointments;
    }

    private UrgentAppointmentDto buildUrgentDto(
            Appointment appointment, String urgencyType, String urgencyMessage, int priorityLevel) {

        User patient = appointment.getPatient();

        return UrgentAppointmentDto.builder()
                .id(appointment.getId())
                .patientName(patient != null ? patient.getFullName() : "N/A")
                .patientPhone(patient != null ? patient.getPhone() : "N/A")
                .patientEmail(patient != null ? patient.getEmail() : "N/A")
                .vaccineName(appointment.getVaccine() != null ? appointment.getVaccine().getName() : "N/A")
                .doseNumber(appointment.getDoseNumber())
                .scheduledDate(appointment.getScheduledDate())
                .scheduledTimeSlot(appointment.getScheduledTimeSlot())
                .actualScheduledTime(appointment.getActualScheduledTime())
                .desiredDate(appointment.getDesiredDate())
                .desiredTimeSlot(appointment.getDesiredTimeSlot())

                .rescheduledAt(appointment.getRescheduledAt())
                .doctorName(appointment.getDoctor() != null ? appointment.getDoctor().getFullName() : null)
                .cashierName(appointment.getCashier() != null ? appointment.getCashier().getFullName() : null)
                .centerName(appointment.getCenter() != null ? appointment.getCenter().getName() : null)
                .status(appointment.getStatus())
                .urgencyType(urgencyType)
                .urgencyMessage(urgencyMessage)
                .priorityLevel(priorityLevel)
                .build();
    }

    public List<AppointmentResponse> getTodayAppointmentsForDoctor() throws AppException {
        User currentUser = authService.getCurrentUserLogin();

        if (currentUser.getId() == null) {
            throw new AppException("User is not a doctor");
        }

        LocalDate today = LocalDate.now();

        List<Appointment> todayAppointments = appointmentRepository
                .findByDoctorAndScheduledDateOrderByScheduledTimeSlotAsc(
                        currentUser,
                        today);

        return todayAppointments.stream()
                .map(AppointmentMapper::toResponse)
                .toList();
    }

    @Transactional(rollbackFor = Exception.class)
    public PaymentResponse bookNextDose(HttpServletRequest request,
            NextDoseBookingRequest bookingRequest) throws Exception {
        User user = authService.getCurrentUserLogin();

        VaccinationCourse course = vaccinationCourseRepository.findById(bookingRequest.getVaccinationCourseId())
                .orElseThrow(() -> new AppException("Vaccination course not found!"));

        // Authorization check
        if (!course.getPatient().getId().equals(user.getId())) {
            throw new AppException("You are not authorized to book for this course");
        }

        if (course.getStatus() != VaccinationCourseStatus.ONGOING) {
            throw new AppException("Vaccination course is not ongoing (Status: " + course.getStatus() + ")");
        }

        Vaccine vaccine = course.getVaccine();
        if (course.getCurrentDoseIndex() >= vaccine.getDosesRequired()) {
            throw new AppException("This course is already completed.");
        }

        boolean hasActive = appointmentRepository.existsByVaccinationCourseAndStatusIn(
                course,
                List.of(AppointmentStatus.PENDING, AppointmentStatus.SCHEDULED, AppointmentStatus.RESCHEDULE));
        if (hasActive) {
            throw new AppException(
                    "You already have an active appointment for this course. Please complete or cancel it first.");
        }

        if (vaccine.getStock() < 1) {
            throw new AppException("Vaccine is out of stock!");
        }
        vaccine.setStock(vaccine.getStock() - 1);
        vaccineRepository.save(vaccine);

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

        Appointment appointment = new Appointment();
        appointment.setPatient(user);
        if (course.getFamilyMember() != null) {
            appointment.setFamilyMember(course.getFamilyMember());
        }

        appointment.setVaccine(vaccine);
        appointment.setTotalAmount(bookingRequest.getAmount());
        appointment.setStatus(AppointmentStatus.PENDING);

        appointment.setVaccinationCourse(course);
        appointment.setDoseNumber(course.getCurrentDoseIndex() + 1);

        appointment.setScheduledDate(bookingRequest.getAppointmentDate());
        if (bookingRequest.getAppointmentTime() != null) {
            appointment.setScheduledTimeSlot(TimeSlotEnum.fromTime(bookingRequest.getAppointmentTime()));
        }
        appointment.setCenter(center);

        appointmentRepository.save(appointment);

        Payment payment = new Payment();
        payment.setReferenceId(appointment.getId());
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
        paymentResponse.setReferenceId(appointment.getId());
        paymentResponse.setPaymentId(payment.getId());
        paymentResponse.setMethod(payment.getMethod());

        Center finalCenter = center;

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
                paymentResponse.setPaymentURL(paypalUrl);
                break;
            case METAMASK:
                paymentResponse.setAmount(bookingRequest.getAmount() / 200000.0);
                break;
            case CASH:
                payment.setStatus(PaymentEnum.PROCESSING);
                payment.setReferenceType(TypeTransactionEnum.APPOINTMENT);
                paymentRepository.save(payment);
                appointment.setStatus(AppointmentStatus.PENDING);
                appointmentRepository.save(appointment);

                try {
                    if (user.getEmail() != null && !user.getEmail().isEmpty()
                            && bookingRequest.getAppointmentDate() != null && finalCenter != null) {
                        String timeSlot = bookingRequest.getAppointmentTime() != null
                                ? bookingRequest.getAppointmentTime().toString()
                                : "Chưa xác định";
                        emailService.sendAppointmentConfirmation(
                                user.getEmail(),
                                user.getFullName(),
                                vaccine.getName(),
                                bookingRequest.getAppointmentDate(),
                                timeSlot,
                                finalCenter.getName(),
                                appointment.getId());
                    }
                } catch (Exception e) {
                    log.error("Failed to send confirmation email: " + e.getMessage());
                }
                break;
        }

        return paymentResponse;
    }

    @Transactional(rollbackFor = Exception.class)
    public PaymentResponse createBooking(HttpServletRequest request, BookingRequest bookingRequest) throws Exception {
        User user = authService.getCurrentUserLogin();
        Vaccine vaccine = vaccineRepository.findById(bookingRequest.getVaccineId())
                .orElseThrow(() -> new AppException("Vaccine not found!"));

        if (vaccine.getStock() < 1) {
            throw new AppException("Vaccine is out of stock!");
        }
        vaccine.setStock(vaccine.getStock() - 1);
        vaccineRepository.save(vaccine);

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

        Appointment appointment = new Appointment();
        FamilyMember familyMember = null;
        if (bookingRequest.getFamilyMemberId() != null) {
            familyMember = familyMemberRepository.findById(bookingRequest.getFamilyMemberId())
                    .orElseThrow(() -> new AppException("Family member not found!"));
            appointment.setFamilyMember(familyMember);
            appointment.setPatient(user);
        } else {
            appointment.setPatient(user);
        }
        appointment.setVaccine(vaccine);
        appointment.setTotalAmount(bookingRequest.getAmount());
        appointment.setStatus(AppointmentStatus.PENDING);

        VaccinationCourse course = handleVaccinationCourse(user, familyMember, vaccine,
                bookingRequest.getAppointmentDate());
        appointment.setVaccinationCourse(course);
        appointment.setDoseNumber(course.getCurrentDoseIndex() + 1);

        appointment.setScheduledDate(bookingRequest.getAppointmentDate());
        if (bookingRequest.getAppointmentTime() != null) {
            appointment.setScheduledTimeSlot(TimeSlotEnum.fromTime(bookingRequest.getAppointmentTime()));
        }
        appointment.setCenter(center);

        appointmentRepository.save(appointment);

        Payment payment = new Payment();
        payment.setReferenceId(appointment.getId());
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
        paymentResponse.setReferenceId(appointment.getId());
        paymentResponse.setPaymentId(payment.getId());
        paymentResponse.setMethod(payment.getMethod());

        Center finalCenter = center;

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
                paymentResponse.setPaymentURL(paypalUrl);
                break;
            case METAMASK:
                paymentResponse.setAmount(bookingRequest.getAmount() / 200000.0);
                break;
            case CASH:
                payment.setStatus(PaymentEnum.PROCESSING);
                payment.setReferenceType(TypeTransactionEnum.APPOINTMENT);
                paymentRepository.save(payment);
                appointment.setStatus(AppointmentStatus.PENDING);
                appointmentRepository.save(appointment);

                try {
                    if (user.getEmail() != null && !user.getEmail().isEmpty()
                            && bookingRequest.getAppointmentDate() != null && finalCenter != null) {
                        String timeSlot = bookingRequest.getAppointmentTime() != null
                                ? bookingRequest.getAppointmentTime().toString()
                                : "Chưa xác định";
                        emailService.sendAppointmentConfirmation(
                                user.getEmail(),
                                user.getFullName(),
                                vaccine.getName(),
                                bookingRequest.getAppointmentDate(),
                                timeSlot,
                                finalCenter.getName(),
                                appointment.getId());
                    }
                } catch (Exception e) {
                    log.error("Failed to send confirmation email: " + e.getMessage());
                }
                break;
        }

        return paymentResponse;
    }

    @Transactional(rollbackFor = Exception.class)
    public AppointmentResponse createWalkInBooking(WalkInBookingRequest request) throws Exception {
        User cashier = authService.getCurrentUserLogin();

        User patient = userRepository.findById(request.getPatientId())
                .orElseThrow(() -> new AppException("Patient not found!"));

        Vaccine vaccine = vaccineRepository.findById(request.getVaccineId())
                .orElseThrow(() -> new AppException("Vaccine not found!"));

        if (vaccine.getStock() < 1) {
            throw new AppException("Vaccine is out of stock!");
        }
        vaccine.setStock(vaccine.getStock() - 1);
        vaccineRepository.save(vaccine);

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

        Appointment appointment = new Appointment();
        FamilyMember familyMember = null;
        if (request.getFamilyMemberId() != null) {
            familyMember = familyMemberRepository.findById(request.getFamilyMemberId())
                    .orElseThrow(() -> new AppException("Family member not found!"));

            if (!familyMember.getUser().getId().equals(patient.getId())) {
                throw new AppException("Family member does not belong to this patient");
            }
            appointment.setFamilyMember(familyMember);
        }
        appointment.setPatient(patient);
        appointment.setVaccine(vaccine);
        appointment.setTotalAmount((double) vaccine.getPrice());
        appointment.setStatus(AppointmentStatus.SCHEDULED);

        VaccinationCourse course = handleVaccinationCourse(patient, familyMember, vaccine,
                request.getAppointmentDate());
        appointment.setVaccinationCourse(course);
        appointment.setDoseNumber(course.getCurrentDoseIndex() + 1);

        appointment.setScheduledDate(request.getAppointmentDate());
        appointment.setScheduledTimeSlot(TimeSlotEnum.fromTime(request.getAppointmentTime()));
        appointment.setActualScheduledTime(request.getActualScheduledTime());
        appointment.setCenter(center);
        appointment.setDoctor(doctor.getUser());
        appointment.setCashier(cashier);
        appointment.setSlot(slot);

        slot.setStatus(SlotStatus.BOOKED);
        slotRepository.save(slot);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        Payment payment = new Payment();
        payment.setReferenceId(savedAppointment.getId());
        payment.setReferenceType(TypeTransactionEnum.APPOINTMENT);
        payment.setAmount((double) vaccine.getPrice());
        payment.setMethod(request.getPaymentMethod());
        payment.setCurrency(request.getPaymentMethod().getCurrency());
        payment.setStatus(PaymentEnum.PROCESSING);
        paymentRepository.save(payment);

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
                        savedAppointment.getId(),
                        1,
                        cashier.getFullName(),
                        cashier.getPhone() != null ? cashier.getPhone() : "N/A",
                        doctor.getUser().getFullName(),
                        doctor.getUser().getPhone() != null ? doctor.getUser().getPhone() : "N/A");
            }
        } catch (Exception e) {
            log.error("Failed to send confirmation email: " + e.getMessage());
        }

        return AppointmentMapper.toResponse(savedAppointment);
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

    private VaccinationCourse handleVaccinationCourse(User patient, FamilyMember familyMember, Vaccine vaccine,
            LocalDate date) throws AppException {
        java.util.Optional<VaccinationCourse> existingCourseOpt;
        if (familyMember != null) {
            existingCourseOpt = vaccinationCourseRepository.findByFamilyMemberAndVaccineAndStatus(
                    familyMember, vaccine, VaccinationCourseStatus.ONGOING);
        } else {
            existingCourseOpt = vaccinationCourseRepository.findByPatientAndFamilyMemberIsNullAndVaccineAndStatus(
                    patient, vaccine, VaccinationCourseStatus.ONGOING);
        }

        if (existingCourseOpt.isPresent()) {
            VaccinationCourse course = existingCourseOpt.get();

            boolean hasActive = appointmentRepository.existsByVaccinationCourseAndStatusIn(
                    course,
                    List.of(AppointmentStatus.PENDING, AppointmentStatus.SCHEDULED, AppointmentStatus.RESCHEDULE));
            if (hasActive) {
                throw new AppException("You already have an active appointment for this vaccination course.");
            }

            // Check if course is actually full but not marked
            if (course.getCurrentDoseIndex() >= vaccine.getDosesRequired()) {
                course.setStatus(VaccinationCourseStatus.COMPLETED);
                vaccinationCourseRepository.save(course);
                // Create new course for re-vaccination
                return createNewCourse(patient, familyMember, vaccine, date);
            }
            return course;
        } else {
            return createNewCourse(patient, familyMember, vaccine, date);
        }
    }

    private VaccinationCourse createNewCourse(User patient, FamilyMember familyMember, Vaccine vaccine,
            LocalDate date) {
        return vaccinationCourseRepository.save(VaccinationCourse.builder()
                .patient(patient)
                .familyMember(familyMember)
                .vaccine(vaccine)
                .status(VaccinationCourseStatus.ONGOING)
                .currentDoseIndex(0)
                .startDate(date != null ? date.atStartOfDay() : LocalDateTime.now())
                .build());
    }

    public List<AppointmentResponse> getBooking() throws AppException {
        User user = authService.getCurrentUserLogin();
        List<Appointment> appointments = appointmentRepository
                .findByPatientAndStatusIn(user,
                        List.of(AppointmentStatus.PENDING, AppointmentStatus.SCHEDULED, AppointmentStatus.RESCHEDULE));
        return appointments.stream()
                .map(apt -> {
                    AppointmentResponse response = AppointmentMapper.toResponse(apt);
                    paymentRepository.findByAppointmentId(apt.getId(), TypeTransactionEnum.APPOINTMENT)
                            .ifPresent(payment -> {
                                response.setPaymentId(payment.getId());
                                response.setPaymentStatus(
                                        payment.getStatus() != null ? payment.getStatus().name() : null);
                                response.setPaymentMethod(
                                        payment.getMethod() != null ? payment.getMethod().name() : null);
                                response.setPaymentAmount(payment.getAmount());
                            });
                    return response;
                })
                .toList();
    }

    public Pagination getAllAppointmentsAsBookings(Specification<Appointment> specification, Pageable pageable)
            throws Exception {
        Page<Appointment> page = appointmentRepository.findAll(specification, pageable);
        Pagination pagination = new Pagination();
        Pagination.Meta meta = new Pagination.Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(page.getTotalPages());
        meta.setTotal(page.getTotalElements());

        pagination.setMeta(meta);
        List<Appointment> list = page.getContent();

        List<AppointmentResponse> result = list.stream().map(AppointmentMapper::toResponse).toList();
        pagination.setResult(result);

        return pagination;
    }

    public List<AppointmentResponse> getHistoryBooking() throws AppException {
        User user = authService.getCurrentUserLogin();
        return appointmentRepository.findByPatient(user).stream()
                .filter(apt -> apt.getFamilyMember() == null)
                .map(apt -> {
                    AppointmentResponse response = AppointmentMapper.toResponse(apt);
                    paymentRepository.findByAppointmentId(apt.getId(), TypeTransactionEnum.APPOINTMENT)
                            .ifPresent(payment -> AppointmentMapper.mapPaymentToResponse(response, payment));
                    return response;
                })
                .toList();
    }

    public List<VaccinationRouteResponse> getGroupedHistoryBookingForFamilyMember(Long familyMemberId)
            throws AppException {
        User user = authService.getCurrentUserLogin();
        // Verify family member belongs to user
        familyMemberRepository.findById(familyMemberId)
                .filter(fm -> fm.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new AppException("Family member not found or does not belong to user"));

        List<AppointmentResponse> flatList = appointmentRepository.findByPatient(user).stream()
                .filter(apt -> apt.getFamilyMember() != null && apt.getFamilyMember().getId().equals(familyMemberId))
                .map(apt -> {
                    AppointmentResponse response = AppointmentMapper.toResponse(apt);
                    paymentRepository.findByAppointmentId(apt.getId(), TypeTransactionEnum.APPOINTMENT)
                            .ifPresent(payment -> {
                                response.setPaymentId(payment.getId());
                                response.setPaymentStatus(
                                        payment.getStatus() != null ? payment.getStatus().name() : null);
                                response.setPaymentMethod(
                                        payment.getMethod() != null ? payment.getMethod().name() : null);
                                response.setPaymentAmount(payment.getAmount());
                            });
                    return response;
                })
                .toList();

        return groupAppointmentsToRoutes(flatList);
    }

    private List<VaccinationRouteResponse> groupAppointmentsToRoutes(List<AppointmentResponse> flatList) {

        // Helper maps to track mutable data before building final response
        // Using a custom inner class or just map manipulation
        class RouteTracker {
            String routeId;
            String vaccineName;
            String vaccineSlug;
            String patientName;
            boolean isFamily;
            int requiredDoses;
            int cycleIndex;
            LocalDateTime createdAt;
            Double totalAmount = 0.0;
            List<AppointmentResponse> appointments = new ArrayList<>();
        }

        Map<String, RouteTracker> userRouteMap = new HashMap<>();

        for (AppointmentResponse apt : flatList) {
            int required = apt.getVaccineTotalDoses() != null ? apt.getVaccineTotalDoses() : 3;
            // Prevent division by zero
            if (required <= 0)
                required = 3;

            String patientName = apt.getPatientName();
            int doseNum = apt.getDoseNumber() != null ? apt.getDoseNumber() : 1;

            // Logic: cycleIndex = ceil(doseNumber / required) - 1
            int cycleIndex = (int) Math.ceil((double) doseNum / required) - 1;
            if (cycleIndex < 0)
                cycleIndex = 0;

            String key;
            if (apt.getVaccinationCourseId() != null) {
                key = String.valueOf(apt.getVaccinationCourseId());
            } else {
                key = apt.getVaccineName() + "-" + patientName + "-" + cycleIndex;
            }

            RouteTracker tracker = userRouteMap.get(key);
            if (tracker == null) {
                tracker = new RouteTracker();
                tracker.routeId = key;
                tracker.vaccineName = apt.getVaccineName();
                tracker.vaccineSlug = apt.getVaccineSlug();
                tracker.patientName = patientName;
                tracker.isFamily = apt.getFamilyMemberId() != null;
                tracker.requiredDoses = required;
                tracker.cycleIndex = cycleIndex;
                tracker.createdAt = apt.getCreatedAt();
                userRouteMap.put(key, tracker);
            }

            // Deduplicate logic if needed, but assuming unique IDs in flatList
            tracker.appointments.add(apt);

            if (!"CANCELLED".equals(apt.getAppointmentStatus().name())) {
                Double amount = apt.getPaymentAmount();
                if (amount == null)
                    amount = 0.0;
                tracker.totalAmount += amount;
            }

            // Update createdAt to latest
            if (apt.getCreatedAt() != null
                    && (tracker.createdAt == null || apt.getCreatedAt().isAfter(tracker.createdAt))) {
                tracker.createdAt = apt.getCreatedAt();
            }
        }

        List<VaccinationRouteResponse> result = new ArrayList<>();

        for (RouteTracker tracker : userRouteMap.values()) {
            // Sort appointments by dose number
            tracker.appointments
                    .sort(Comparator.comparingInt(a -> a.getDoseNumber() != null ? a.getDoseNumber() : 0));

            // Determine status
            long completedCount = tracker.appointments.stream()
                    .filter(a -> "COMPLETED".equals(a.getAppointmentStatus().name()))
                    .count();

            String status = "IN_PROGRESS";
            if (completedCount >= tracker.requiredDoses) {
                status = "COMPLETED";
            } else if (tracker.appointments.stream().anyMatch(a -> "CANCELLED".equals(a.getAppointmentStatus().name()))
                    && tracker.appointments.size() == 1) {
                // If only one appointment and it's cancelled, maybe whole route is cancelled?
                // But usually we just say In Progress until completed.
                // Let's keep specific logic simple for now.
            }

            result.add(VaccinationRouteResponse.builder()
                    .routeId(tracker.routeId)
                    .vaccineName(tracker.vaccineName)
                    .vaccineSlug(tracker.vaccineSlug)
                    .patientName(tracker.patientName)
                    .isFamily(tracker.isFamily)
                    .requiredDoses(tracker.requiredDoses)
                    .cycleIndex(tracker.cycleIndex)
                    .createdAt(tracker.createdAt)
                    .totalAmount(tracker.totalAmount)
                    .status(status)
                    .completedCount((int) completedCount)
                    .appointments(tracker.appointments)
                    .build());
        }

        result.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        return result;
    }

    public List<VaccinationRouteResponse> getGroupedHistoryBooking() throws AppException {
        List<AppointmentResponse> flatList = getHistoryBooking();
        return groupAppointmentsToRoutes(flatList);
    }
}
