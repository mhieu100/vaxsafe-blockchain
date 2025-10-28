package com.dapp.backend.service;

import com.dapp.backend.dto.mapper.AppointmentMapper;
import com.dapp.backend.dto.request.ProcessAppointmentRequest;
import com.dapp.backend.dto.response.AppointmentResponse;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.enums.AppointmentEnum;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.Center;
import com.dapp.backend.model.User;
import com.dapp.backend.repository.AppointmentRepository;
import com.dapp.backend.repository.UserRepository;
import com.dapp.backend.service.spec.AppointmentSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

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

    public AppointmentResponse processAppointment(ProcessAppointmentRequest request) throws Exception {
        User cashier = authService.getCurrentUserLogin();
        User doctor = userRepository.findById(request.getDoctorId()).orElseThrow(() -> new AppException("Doctor not found"));
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId()).orElseThrow(() -> new AppException("Appointment not found"));
        appointment.setDoctor(doctor);
        appointment.setCashier(cashier);
        appointment.setStatus(AppointmentEnum.SCHEDULED);
        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }


    public String complete(long id) throws AppException {
        Appointment appointment = appointmentRepository.findById(id).orElseThrow(() -> new AppException("Appointment not found " + id));
        appointment.setStatus(AppointmentEnum.COMPLETED);
        appointmentRepository.save(appointment);
        return "Appointment update success";
    }

    public String cancel(long id) throws AppException {
        Appointment appointment = appointmentRepository.findById(id).orElseThrow(() -> new AppException("Appointment not found " + id));
        appointment.setStatus(AppointmentEnum.CANCELLED);
        appointmentRepository.save(appointment);
        return "Appointment update success";
    }
}
