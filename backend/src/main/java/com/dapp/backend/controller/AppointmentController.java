package com.dapp.backend.controller;

import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.service.AppointmentService;
import com.turkraft.springfilter.boot.Filter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping("/center")
    public ResponseEntity<Pagination> getAllAppointmentOfCenter(@Filter Specification<Appointment> specification, Pageable pageable) {
        return ResponseEntity.ok(appointmentService.getAllAppointmentOfCenter(specification, pageable));
    }

}
