package com.dapp.backend.service;

import com.dapp.backend.dto.mapper.AppointmentMapper;
import com.dapp.backend.dto.request.BookingBlcRequest;
import com.dapp.backend.dto.request.ProcessAppointmentBlcRequest;
import com.dapp.backend.dto.request.ProcessAppointmentRequest;
import com.dapp.backend.dto.response.AppointmentResponse;
import com.dapp.backend.dto.response.BookingBlcResponse;
import com.dapp.backend.dto.response.Pagination;
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
import org.springframework.web.client.RestTemplate;

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
        appointment.setDoctor(doctor);
        appointment.setCashier(cashier);
        appointment.setStatus(AppointmentEnum.SCHEDULED);
        appointmentRepository.save(appointment);

        ProcessAppointmentBlcRequest processAppointmentBlcRequest = new ProcessAppointmentBlcRequest();
        processAppointmentBlcRequest.setCashier(cashier.getFullName());
        processAppointmentBlcRequest.setDoctor(doctor.getFullName());

        String token = tokenExtractor.extractToken(request);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " +token);

        HttpEntity<ProcessAppointmentBlcRequest> entity = new HttpEntity<>(processAppointmentBlcRequest, headers);


        restTemplate.exchange(blockchainUrl+"/bookings/appointments/"+processAppointmentRequest.getAppointmentId()+"/assign-staff", HttpMethod.PUT, entity,  Void.class );


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

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        restTemplate.exchange(
                blockchainUrl + "/bookings/appointments/"
                        + id
                        + "/completed",
                HttpMethod.PUT,
                entity,
                Void.class
        );


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

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        restTemplate.exchange(
                blockchainUrl + "/bookings/appointments/"
                        + id
                        + "/cancelled",
                HttpMethod.PUT,
                entity,
                Void.class
        );

        return "Appointment update success";
    }
}
