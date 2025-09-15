package com.dapp.backend.service;

import com.dapp.backend.dto.mapper.AppointmentMapper;
import com.dapp.backend.dto.mapper.BookingMapper;
import com.dapp.backend.dto.request.ProcessAppointmentRequest;
import com.dapp.backend.dto.response.AppointmentResponse;
import com.dapp.backend.dto.response.BookingResponse;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.Booking;
import com.dapp.backend.model.User;
import com.dapp.backend.repository.AppointmentRepository;
import com.dapp.backend.repository.UserRepository;
import com.dapp.backend.security.JwtUtil;
import com.dapp.backend.service.spec.AppointmentSpecifications;
import com.dapp.backend.util.AppointmentEnum;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    public Pagination getAllAppointmentOfCenter(Specification<Appointment> specification, Pageable pageable) throws AppException {

        String email = JwtUtil.getCurrentUserLogin().isPresent() ? JwtUtil.getCurrentUserLogin().get() : "";
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException("User not found"));

        specification = Specification.where(specification).and(AppointmentSpecifications.findByCenter(user.getCenter().getName()));

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

    public AppointmentResponse processAppointment(ProcessAppointmentRequest request) throws Exception {
        String email = JwtUtil.getCurrentUserLogin().isPresent() ? JwtUtil.getCurrentUserLogin().get() : "";
        User cashier = userRepository.findByEmail(email).orElseThrow(() -> new AppException("Cashier not found"));
        User doctor = userRepository.findById(request.getDoctorId()).orElseThrow(() -> new AppException("Doctor not found"));
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId()).orElseThrow(() -> new AppException("Appointment not found"));
        appointment.setDoctor(doctor);
        appointment.setCashier(cashier);
        appointment.setStatus(AppointmentEnum.SCHEDULED);
        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

}
