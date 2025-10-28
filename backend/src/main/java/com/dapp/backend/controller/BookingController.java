package com.dapp.backend.controller;

import com.dapp.backend.dto.request.BookingRequest;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.dto.response.PaymentResponse;
import com.dapp.backend.model.Booking;
import com.dapp.backend.service.BookingService;
import com.turkraft.springfilter.boot.Filter;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.service.UserService;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {
        private final BookingService bookingService;
        private final UserService userService;

        @PostMapping
        @ApiMessage("Create a booking")
        public ResponseEntity<PaymentResponse> createBooking(@RequestBody BookingRequest request) throws Exception {
            return ResponseEntity.ok(bookingService.createBooking(request));
        }

        @GetMapping()
        @ApiMessage("Get all bookings")
        public ResponseEntity<Pagination> getAllBookings(@Filter Specification<Booking> specification, Pageable pageable) throws Exception {
                return ResponseEntity.ok().body(bookingService.getAllBookings(specification, pageable));
        }

}
