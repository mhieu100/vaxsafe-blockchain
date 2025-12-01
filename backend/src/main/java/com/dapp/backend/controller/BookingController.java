package com.dapp.backend.controller;

import com.dapp.backend.dto.request.BookingRequest;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.dto.response.PaymentResponse;
import com.dapp.backend.model.Booking;
import com.dapp.backend.service.BookingService;
import com.turkraft.springfilter.boot.Filter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dapp.backend.annotation.ApiMessage;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {
        private final BookingService bookingService;

        @PostMapping
        @ApiMessage("Create a booking")
        public ResponseEntity<PaymentResponse> createBooking(HttpServletRequest request, @RequestBody BookingRequest bookingRequest) throws Exception {
            return ResponseEntity.ok(bookingService.createBooking(request, bookingRequest));
        }

        @GetMapping
        @ApiMessage("Get all bookings")
        public ResponseEntity<Pagination> getAllBookings(@Filter Specification<Booking> specification, Pageable pageable) throws Exception {
                return ResponseEntity.ok().body(bookingService.getAllBookings(specification, pageable));
        }

}
