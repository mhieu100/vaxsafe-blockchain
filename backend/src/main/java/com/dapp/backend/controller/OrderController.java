package com.dapp.backend.controller;

import com.dapp.backend.dto.request.OrderRequest;
import com.dapp.backend.dto.response.OrderResponse;

import com.dapp.backend.dto.response.PaymentResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.service.OrderService;
import com.paypal.base.rest.PayPalRESTException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    @PostMapping
    public ResponseEntity<PaymentResponse> create(@RequestBody OrderRequest request) throws AppException, PayPalRESTException {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrder() throws AppException {
        return ResponseEntity.ok(orderService.getOrder());
    }
}
