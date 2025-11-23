package com.dapp.backend.service;

import com.dapp.backend.dto.mapper.AppointmentMapper;
import com.dapp.backend.dto.request.BookingBlcRequest;
import com.dapp.backend.dto.request.ProcessAppointmentBlcRequest;
import com.dapp.backend.dto.request.ProcessAppointmentRequest;
import com.dapp.backend.dto.request.RescheduleAppointmentRequest;
import com.dapp.backend.dto.response.AppointmentResponse;
import com.dapp.backend.dto.response.BookingBlcResponse;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.dto.response.RescheduleAppointmentResponse;
import com.dapp.backend.enums.AppointmentEnum;
import com.dapp.backend.enums.BookingEnum;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.Booking;
import com.dapp.backend.model.Center;
import com.dapp.backend.model.User;
import com.dapp.backend.repository.AppointmentRepository;
import com.dapp.backend.repository.BookingRepository;
import com.dapp.backend.repository.UserRepository;
import com.dapp.backend.service.spec.AppointmentSpecifications;
import com.dapp.backend.util.TokenExtractor;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final AppointmentRepository appointmentRepository;
    private final RestTemplate restTemplate;
    private final TokenExtractor tokenExtractor;
    @Value("${blockchainUrl}")
    private String blockchainUrl;

    public Pagination getAllAppointmentOfCenter(Specification<Appointment> specification, Pageable pageable) throws AppException {
        User user = authService.getCurrentUserLogin();
        Center center = user.getCenter();

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
        List<AppointmentResponse> result = list.stream().map(AppointmentMapper::toResponse).toList();
        pagination.setResult(result);
        return pagination;
    }

    public Pagination getAllAppointmentsOfDoctor(Specification<Appointment> specification, Pageable pageable) throws AppException {
        User user = authService.getCurrentUserLogin();
        specification = Specification.where(specification).and(AppointmentSpecifications.findByDoctor(user.getFullName()));
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

    private void checkAndUpdateBookingStatus(Booking booking) {
        List<Appointment> appointments = appointmentRepository.findByBooking(booking);

        if (appointments.stream().allMatch(a -> a.getStatus() == AppointmentEnum.COMPLETED)) {
            booking.setStatus(BookingEnum.COMPLETED);
        } else if (appointments.stream().anyMatch(a -> a.getStatus() == AppointmentEnum.CANCELLED)) {

            appointments.stream()
                    .filter(a -> a.getStatus() == AppointmentEnum.SCHEDULED)
                    .forEach(a -> {
                        a.setStatus(AppointmentEnum.CANCELLED);
                        appointmentRepository.save(a);
                    });

            booking.setStatus(BookingEnum.CANCELLED);

        }

        bookingRepository.save(booking);
    }

    public AppointmentResponse updateScheduledAppointment(HttpServletRequest request, ProcessAppointmentRequest processAppointmentRequest) throws Exception {
        User cashier = authService.getCurrentUserLogin();
        User doctor = userRepository.findById(processAppointmentRequest.getDoctorId()).orElseThrow(() -> new AppException("Doctor not found"));
        Appointment appointment = appointmentRepository.findById(processAppointmentRequest.getAppointmentId()).orElseThrow(() -> new AppException("Appointment not found"));

        // If appointment is in PENDING_APPROVAL status (rescheduled), apply the desired date/time
        if (appointment.getStatus() == AppointmentEnum.PENDING_APPROVAL) {
            if (appointment.getDesiredDate() != null) {
                appointment.setScheduledDate(appointment.getDesiredDate());
            }
            if (appointment.getDesiredTime() != null) {
                appointment.setScheduledTime(appointment.getDesiredTime());
            }
        }

        appointment.setDoctor(doctor);
        appointment.setCashier(cashier);
        appointment.setStatus(AppointmentEnum.SCHEDULED);
        appointmentRepository.save(appointment);

        ProcessAppointmentBlcRequest processAppointmentBlcRequest = new ProcessAppointmentBlcRequest();
        processAppointmentBlcRequest.setCashier(cashier.getFullName());
        processAppointmentBlcRequest.setDoctor(doctor.getFullName());

//        String token = tokenExtractor.extractToken(request);
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//        headers.set("Authorization", "Bearer " +token);
//
//        HttpEntity<ProcessAppointmentBlcRequest> entity = new HttpEntity<>(processAppointmentBlcRequest, headers);
//        restTemplate.exchange(blockchainUrl+"/bookings/appointments/"+processAppointmentRequest.getAppointmentId()+"/assign-staff", HttpMethod.PUT, entity,  Void.class );


        return AppointmentMapper.toResponse(appointment);
    }

    public String complete(HttpServletRequest request, long id) throws AppException {
        Appointment appointment = appointmentRepository.findById(id).orElseThrow(() -> new AppException("Appointment not found " + id));
        appointment.setStatus(AppointmentEnum.COMPLETED);
        appointmentRepository.save(appointment);
        checkAndUpdateBookingStatus(appointment.getBooking());

        String token = tokenExtractor.extractToken(request);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + token);

//        HttpEntity<Void> entity = new HttpEntity<>(headers);
//        restTemplate.exchange(blockchainUrl + "/bookings/appointments/" + id + "/completed", HttpMethod.PUT, entity, Void.class);


        return "Appointment update success";
    }

    public String cancel(HttpServletRequest request, long id) throws AppException {
        Appointment appointment = appointmentRepository.findById(id).orElseThrow(() -> new AppException("Appointment not found " + id));
        appointment.setStatus(AppointmentEnum.CANCELLED);
        appointmentRepository.save(appointment);
        checkAndUpdateBookingStatus(appointment.getBooking());
        String token = tokenExtractor.extractToken(request);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + token);

//        HttpEntity<Void> entity = new HttpEntity<>(headers);
//        restTemplate.exchange(blockchainUrl + "/bookings/appointments/" + id + "/cancelled", HttpMethod.PUT, entity, Void.class);

        return "Appointment update success";
    }

    @Transactional
    public RescheduleAppointmentResponse rescheduleAppointment(RescheduleAppointmentRequest request) throws AppException {
        // Get current user
        User currentUser = authService.getCurrentUserLogin();

        // Get appointment
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new AppException("Appointment not found"));

        // Verify user owns this appointment (check through booking)
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

        // Check if appointment can be rescheduled
        if (appointment.getStatus() == AppointmentEnum.COMPLETED) {
            throw new AppException("Cannot reschedule completed appointments");
        }

        if (appointment.getStatus() == AppointmentEnum.CANCELLED) {
            throw new AppException("Cannot reschedule cancelled appointments");
        }

        // Store old date and time
        LocalDate oldDate = appointment.getScheduledDate();
        LocalTime oldTime = appointment.getScheduledTime();

        // Update appointment with desired date/time
        appointment.setDesiredDate(request.getDesiredDate());
        appointment.setDesiredTime(request.getDesiredTime());
        appointment.setRescheduleReason(request.getReason());
        appointment.setRescheduledAt(LocalDateTime.now());

        // Change status to PENDING_APPROVAL for cashier review
        appointment.setStatus(AppointmentEnum.PENDING_APPROVAL);

        appointmentRepository.save(appointment);

        return RescheduleAppointmentResponse.builder()
                .appointmentId(appointment.getId())
                .oldDate(oldDate)
                .oldTime(oldTime)
                .newDate(request.getDesiredDate())
                .newTime(request.getDesiredTime())
                .status(AppointmentEnum.PENDING_APPROVAL)
                .message("Reschedule request submitted successfully. Waiting for cashier approval and doctor reassignment.")
                .build();
    }

    /**
     * Get urgent appointments for cashier dashboard
     * Returns appointments that need immediate attention
     */
    public List<com.dapp.backend.dto.response.UrgentAppointmentDto> getUrgentAppointments() throws AppException {
        User currentUser = authService.getCurrentUserLogin();
        Center center = currentUser.getCenter();

        if (center == null) {
            throw new AppException("User is not associated with any center.");
        }

        List<com.dapp.backend.dto.response.UrgentAppointmentDto> urgentAppointments = new java.util.ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // 1. Appointments with pending reschedule requests (HIGHEST PRIORITY)
        List<Appointment> rescheduleRequests = appointmentRepository
                .findByStatusAndDesiredDateIsNotNullAndCenter(AppointmentEnum.PENDING_APPROVAL, center);

        for (Appointment apt : rescheduleRequests) {
            urgentAppointments.add(buildUrgentDto(apt, "RESCHEDULE_PENDING",
                    "Yêu cầu đổi lịch chờ phê duyệt", 1));
        }

        // 2. Scheduled appointments without doctor assigned (within next 24 hours - HIGH PRIORITY)
        // Get appointments from today to tomorrow (to cover the 24-hour window)
        // Include both SCHEDULED and PENDING_SCHEDULE status appointments
        List<Appointment> noDoctorAppointments = appointmentRepository
                .findAppointmentsWithoutDoctor(
                        List.of(AppointmentEnum.SCHEDULED, AppointmentEnum.PENDING_SCHEDULE),
                        today,
                        today.plusDays(2), // Get today and tomorrow to ensure we capture all within 24h
                        center
                );

        LocalDateTime currentDateTime = LocalDateTime.of(today, now);
        LocalDateTime next24Hours = currentDateTime.plusHours(24);

        for (Appointment apt : noDoctorAppointments) {
            LocalDateTime appointmentDateTime = LocalDateTime.of(
                    apt.getScheduledDate(),
                    apt.getScheduledTime() != null ? apt.getScheduledTime() : LocalTime.MIDNIGHT
            );

            // Only include if appointment is within the next 24 hours
            if (appointmentDateTime.isAfter(currentDateTime) && appointmentDateTime.isBefore(next24Hours)) {
                long hoursUntil = java.time.temporal.ChronoUnit.HOURS.between(currentDateTime, appointmentDateTime);
                String message = String.format("KHẨN CẤP: Chưa có bác sĩ - còn %d giờ", hoursUntil);
                urgentAppointments.add(buildUrgentDto(apt, "NO_DOCTOR", message, 1));
            }
        }

        // 3. Appointments coming soon (within next 4 hours)
        LocalTime fourHoursLater = now.plusHours(4);
        List<Appointment> comingSoonAppointments = appointmentRepository
                .findAppointmentsComingSoon(
                        AppointmentEnum.SCHEDULED,
                        today,
                        now,
                        fourHoursLater,
                        center
                );

        for (Appointment apt : comingSoonAppointments) {
            long minutesUntil = java.time.temporal.ChronoUnit.MINUTES.between(
                    now, apt.getScheduledTime());
            String message = String.format("Sắp đến giờ hẹn - còn %d phút", minutesUntil);
            urgentAppointments.add(buildUrgentDto(apt, "COMING_SOON", message, 3));
        }

        // 4. Overdue appointments (past scheduled time but not completed)
        List<AppointmentEnum> overdueStatuses = java.util.Arrays.asList(
                AppointmentEnum.SCHEDULED,
                AppointmentEnum.PENDING_SCHEDULE,
                AppointmentEnum.PENDING_APPROVAL
        );
        List<Appointment> overdueAppointments = appointmentRepository
                .findOverdueAppointments(overdueStatuses, today, now, center);

        for (Appointment apt : overdueAppointments) {
            urgentAppointments.add(buildUrgentDto(apt, "OVERDUE",
                    "Quá hạn xử lý - cần kiểm tra ngay", 2));
        }

        // Sort by priority level (1 = highest priority)
        urgentAppointments.sort(java.util.Comparator.comparingInt(
                com.dapp.backend.dto.response.UrgentAppointmentDto::getPriorityLevel));

        return urgentAppointments;
    }

    private com.dapp.backend.dto.response.UrgentAppointmentDto buildUrgentDto(
            Appointment appointment, String urgencyType, String urgencyMessage, int priorityLevel) {

        Booking booking = appointment.getBooking();
        User patient = booking.getPatient();

        return com.dapp.backend.dto.response.UrgentAppointmentDto.builder()
                .id(appointment.getId())
                .bookingId(booking.getBookingId())
                .patientName(patient != null ? patient.getFullName() : "N/A")
                .patientPhone(patient != null && patient.getPatientProfile() != null ?
                        patient.getPatientProfile().getPhone() : "N/A")
                .patientEmail(patient != null ? patient.getEmail() : "N/A")
                .vaccineName(booking.getVaccine() != null ? booking.getVaccine().getName() : "N/A")
                .doseNumber(appointment.getDoseNumber())
                .scheduledDate(appointment.getScheduledDate())
                .scheduledTime(appointment.getScheduledTime())
                .desiredDate(appointment.getDesiredDate())
                .desiredTime(appointment.getDesiredTime())
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

    /**
     * Get today's appointments for doctor dashboard
     * Returns all appointments scheduled for today for the logged-in doctor
     */
    public List<AppointmentResponse> getTodayAppointmentsForDoctor() throws AppException {
        User currentUser = authService.getCurrentUserLogin();

        // Get doctor entity from current user
        if (currentUser.getId() == null) {
            throw new AppException("User is not a doctor");
        }

        LocalDate today = LocalDate.now();

        // Find all appointments for this doctor on today's date
        List<Appointment> todayAppointments = appointmentRepository
                .findByDoctorAndScheduledDateOrderByScheduledTimeAsc(
                        currentUser.getDoctor(),
                        today
                );

        // Convert to response DTOs
        return todayAppointments.stream()
                .map(AppointmentMapper::toResponse)
                .toList();
    }
}
