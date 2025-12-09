package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.dto.request.BookingRequest;
import com.dapp.backend.dto.request.WalkInBookingRequest;
import com.dapp.backend.dto.response.*;
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

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
        private final AppointmentService appointmentService;

        @PostMapping
        @ApiMessage("Create a booking")
        public ResponseEntity<PaymentResponse> createBooking(HttpServletRequest request,
                        @RequestBody BookingRequest bookingRequest) throws Exception {
                return ResponseEntity.ok(appointmentService.createBooking(request, bookingRequest));
        }

        @GetMapping
        @ApiMessage("Get all bookings")
        public ResponseEntity<Pagination> getAllBookings(@Filter Specification<Appointment> specification,
                        Pageable pageable) throws Exception {
                return ResponseEntity.ok()
                                .body(appointmentService.getAllAppointmentsAsBookings(specification, pageable));
        }

        @GetMapping("/my-bookings")
        @ApiMessage("Get booking of user")
        public ResponseEntity<List<AppointmentResponse>> getMyBookings() throws Exception {
                return ResponseEntity.ok(appointmentService.getBooking());
        }

        @GetMapping("/history")
        @ApiMessage("Get history booking of user")
        public ResponseEntity<List<AppointmentResponse>> getHistoryBookings() throws Exception {
                return ResponseEntity.ok(appointmentService.getHistoryBooking());
        }

        @GetMapping("/history/grouped")
        @ApiMessage("Get grouped vaccination history (routes)")
        public ResponseEntity<List<VaccinationRouteResponse>> getGroupedHistoryBookings() throws Exception {
                return ResponseEntity.ok(appointmentService.getGroupedHistoryBooking());
        }

        @PostMapping("/walk-in")
        @ApiMessage("Create walk-in booking with direct doctor assignment")
        public ResponseEntity<BookingResponse> createWalkInBooking(@Valid @RequestBody WalkInBookingRequest request)
                        throws Exception {
                return ResponseEntity.ok(appointmentService.createWalkInBooking(request));
        }

        @GetMapping("/availability")
        @ApiMessage("Check slot availability for a center on a specific date")
        public ResponseEntity<CenterAvailabilityResponse> checkAvailability(
                        @RequestParam Long centerId,
                        @RequestParam LocalDate date) throws Exception {
                return ResponseEntity.ok(appointmentService.checkAvailability(centerId, date));
        }

}
