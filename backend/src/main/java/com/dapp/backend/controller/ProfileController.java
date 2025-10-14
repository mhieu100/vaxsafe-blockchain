package com.dapp.backend.controller;

import com.dapp.backend.model.Booking;
import com.dapp.backend.model.Order;
import com.dapp.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final PaymentService paymentService;

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrders(@RequestParam String walletAddress) {
        return ResponseEntity.ok(paymentService.getOrders(walletAddress));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getBookings(@RequestParam String walletAddress) {
        return ResponseEntity.ok(paymentService.getBookings(walletAddress));
    }
}
