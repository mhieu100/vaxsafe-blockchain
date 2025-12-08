package com.dapp.backend.service;

import com.dapp.backend.dto.mapper.AppointmentMapper;
import com.dapp.backend.dto.mapper.UserMapper;
import com.dapp.backend.dto.request.ProcessAppointmentRequest;
import com.dapp.backend.dto.request.RescheduleAppointmentRequest;
import com.dapp.backend.dto.response.AppointmentResponse;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.dto.response.RescheduleAppointmentResponse;
import com.dapp.backend.dto.response.UrgentAppointmentDto;
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
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AuthService authService;
    private final BookingRepository bookingRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorAvailableSlotRepository slotRepository;
    private final TokenExtractor tokenExtractor;
    private final PaymentRepository paymentRepository;
    private final VaccineRecordService vaccineRecordService;
    private final VaccinationReminderService reminderService;
    private final NextDoseReminderService nextDoseReminderService;
    private final EmailService emailService;

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

    private void checkAndUpdateBookingStatus(Booking booking) {
        List<Appointment> appointments = appointmentRepository.findByBooking(booking);

        if (appointments.stream().allMatch(a -> a.getStatus() == AppointmentStatus.COMPLETED)) {
            booking.setStatus(BookingEnum.COMPLETED);
        } else if (appointments.stream().anyMatch(a -> a.getStatus() == AppointmentStatus.CANCELLED)) {

            appointments.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.SCHEDULED)
                    .forEach(a -> {
                        a.setStatus(AppointmentStatus.CANCELLED);
                        appointmentRepository.save(a);
                    });

            booking.setStatus(BookingEnum.CANCELLED);

        }

        bookingRepository.save(booking);
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
            reminderService.createRemindersForAppointment(savedAppointment);
            log.info("Created reminders for appointment ID: {}", savedAppointment.getId());
        } catch (Exception e) {
            log.error("Failed to create reminders for appointment ID: {}", savedAppointment.getId(), e);

        }


        try {
            User patient = savedAppointment.getBooking().getPatient();
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
                        savedAppointment.getBooking().getVaccine().getName(),
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
            com.dapp.backend.dto.request.CompleteAppointmentRequest completeRequest) throws AppException {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppException("Appointment not found " + id));


        if (appointment.getVaccinationDate() == null) {
            appointment.setVaccinationDate(LocalDate.now());
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);
        checkAndUpdateBookingStatus(appointment.getBooking());


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

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
        checkAndUpdateBookingStatus(appointment.getBooking());


        try {
            User patient = appointment.getBooking().getPatient();
            if (patient != null && patient.getEmail() != null && !patient.getEmail().isEmpty()) {
                emailService.sendAppointmentCancellation(
                        patient.getEmail(),
                        patient.getFullName(),
                        appointment.getBooking().getVaccine().getName(),
                        appointment.getScheduledDate(),
                        "Bạn đã yêu cầu hủy lịch hẹn");
                log.info("Sent cancellation email to: {}", patient.getEmail());
            }
        } catch (Exception e) {
            log.error("Failed to send cancellation email for appointment ID: {}", id, e);

        }

        String token = tokenExtractor.extractToken(request);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + token);


        return "Appointment update success";
    }

    @Transactional
    public RescheduleAppointmentResponse rescheduleAppointment(RescheduleAppointmentRequest request)
            throws AppException {

        User currentUser = authService.getCurrentUserLogin();


        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new AppException("Appointment not found"));


        Booking booking = appointment.getBooking();
        boolean isOwner = false;

        if (booking.getPatient() != null && booking.getPatient().getId().equals(currentUser.getId())) {
            isOwner = true;
        } else if (booking.getFamilyMember() != null &&
                booking.getFamilyMember().getUser().getId().equals(currentUser.getId())) {
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

        appointment.setRescheduleReason(request.getReason());
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

    
    public List<com.dapp.backend.dto.response.UrgentAppointmentDto> getUrgentAppointments() throws AppException {
        User currentUser = authService.getCurrentUserLogin();
        Center center = UserMapper.getCenter(currentUser);

        if (center == null) {
            throw new AppException("User is not associated with any center.");
        }

        List<com.dapp.backend.dto.response.UrgentAppointmentDto> urgentAppointments = new java.util.ArrayList<>();
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
                com.dapp.backend.dto.response.UrgentAppointmentDto::getPriorityLevel));

        return urgentAppointments;
    }

    private UrgentAppointmentDto buildUrgentDto(
            Appointment appointment, String urgencyType, String urgencyMessage, int priorityLevel) {

        Booking booking = appointment.getBooking();
        User patient = booking.getPatient();

        return UrgentAppointmentDto.builder()
                .id(appointment.getId())
                .bookingId(booking.getBookingId())
                .patientName(patient != null ? patient.getFullName() : "N/A")
                .patientPhone(patient != null ? patient.getPhone() : "N/A")
                .patientEmail(patient != null ? patient.getEmail() : "N/A")
                .vaccineName(booking.getVaccine() != null ? booking.getVaccine().getName() : "N/A")
                .doseNumber(appointment.getDoseNumber())
                .scheduledDate(appointment.getScheduledDate())
                .scheduledTimeSlot(appointment.getScheduledTimeSlot())
                .actualScheduledTime(appointment.getActualScheduledTime())
                .desiredDate(appointment.getDesiredDate())
                .desiredTimeSlot(appointment.getDesiredTimeSlot())
                .rescheduleReason(appointment.getRescheduleReason())
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
}
