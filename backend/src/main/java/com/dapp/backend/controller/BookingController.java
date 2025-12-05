package com.dapp.backend.controller;

import com.dapp.backend.dto.request.BookingRequest;
import com.dapp.backend.dto.request.WalkInBookingRequest;
import com.dapp.backend.dto.response.BookingResponse;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.dto.response.PaymentResponse;
import com.dapp.backend.model.Booking;
import com.dapp.backend.service.BookingService;
import com.turkraft.springfilter.boot.Filter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.dto.response.CenterAvailabilityResponse;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
        private final BookingService bookingService;

        @PostMapping
        @ApiMessage("Create a booking")
        public ResponseEntity<PaymentResponse> createBooking(HttpServletRequest request,
                        @RequestBody BookingRequest bookingRequest) throws Exception {
                return ResponseEntity.ok(bookingService.createBooking(request, bookingRequest));
        }

        @GetMapping
        @ApiMessage("Get all bookings")
        public ResponseEntity<Pagination> getAllBookings(@Filter Specification<Booking> specification,
                        Pageable pageable) throws Exception {
                return ResponseEntity.ok().body(bookingService.getAllBookings(specification, pageable));
        }

        @GetMapping("/my-bookings")
        @ApiMessage("Get booking of user")
        public ResponseEntity<List<BookingResponse>> getMyBookings() throws Exception {
                return ResponseEntity.ok(bookingService.getBooking());
        }

        @GetMapping("/history")
        @ApiMessage("Get history booking of user")
        public ResponseEntity<List<BookingResponse>> getHistoryBookings() throws Exception {
                return ResponseEntity.ok(bookingService.getHistoryBooking());
        }

        @PostMapping("/walk-in")
        @ApiMessage("Create walk-in booking with direct doctor assignment")
        public ResponseEntity<BookingResponse> createWalkInBooking(@Valid @RequestBody WalkInBookingRequest request)
                        throws Exception {
                return ResponseEntity.ok(bookingService.createWalkInBooking(request));
        }

        @GetMapping("/availability")
        @ApiMessage("Check slot availability for a center on a specific date")
        public ResponseEntity<CenterAvailabilityResponse> checkAvailability(
                        @RequestParam Long centerId,
                        @RequestParam LocalDate date) throws Exception {
                return ResponseEntity.ok(bookingService.checkAvailability(centerId, date));
        }

}
