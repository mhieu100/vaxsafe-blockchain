package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.dto.request.ProcessAppointmentRequest;
import com.dapp.backend.dto.request.RescheduleAppointmentRequest;
import com.dapp.backend.dto.response.AppointmentResponse;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.dto.response.RescheduleAppointmentResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.service.AppointmentService;
import com.turkraft.springfilter.boot.Filter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
    public ResponseEntity<AppointmentResponse> updateAppointmentOfCashier(HttpServletRequest request, @RequestBody ProcessAppointmentRequest processAppointmentRequest) throws Exception {
        return ResponseEntity.ok().body(appointmentService.updateScheduledAppointment(request,processAppointmentRequest));
    }

    @GetMapping("/my-schedules")
    @ApiMessage("Get all appointments of doctor")
    public ResponseEntity<Pagination> getAllAppointmentsOfDoctor(@Filter Specification<Appointment> specification, Pageable pageable) throws Exception {
        return ResponseEntity.ok().body(appointmentService.getAllAppointmentsOfDoctor(specification, pageable));
    }

    @PutMapping("/{id}/complete")
    @ApiMessage("Complete a appointment")
    public ResponseEntity<String> completeAppointment(HttpServletRequest request, @PathVariable long id) throws Exception {
        return ResponseEntity.ok().body(appointmentService.complete(request, id));
    }

    @PutMapping("/reschedule")
    @ApiMessage("Reschedule an appointment")
    public ResponseEntity<RescheduleAppointmentResponse> rescheduleAppointment(
            @RequestBody @Valid RescheduleAppointmentRequest request) throws AppException {
        RescheduleAppointmentResponse response = appointmentService.rescheduleAppointment(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/cancel")
    @ApiMessage("Cancel a appointment")
    public ResponseEntity<String> cancelAppointment(HttpServletRequest request, @PathVariable long id) throws Exception {
        return ResponseEntity.ok().body(appointmentService.cancel(request, id));
    }

}
