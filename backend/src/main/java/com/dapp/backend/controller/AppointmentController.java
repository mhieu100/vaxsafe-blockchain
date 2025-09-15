package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.dto.request.ProcessAppointmentRequest;
import com.dapp.backend.dto.response.AppointmentResponse;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.service.AppointmentService;
import com.turkraft.springfilter.boot.Filter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping("/center")
    public ResponseEntity<Pagination> getAllAppointmentOfCenter(@Filter Specification<Appointment> specification, Pageable pageable) throws AppException {
        return ResponseEntity.ok(appointmentService.getAllAppointmentOfCenter(specification, pageable));
    }

    @PutMapping
    @ApiMessage("Update a appointment of cashier")
    public ResponseEntity<AppointmentResponse> updateAppointmentOfCashier(@RequestBody ProcessAppointmentRequest request) throws Exception {
                return ResponseEntity.ok().body(appointmentService.processAppointment(request));
        }
}
