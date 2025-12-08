package com.dapp.backend.service;

import com.dapp.backend.dto.request.OrderRequest;
import com.dapp.backend.dto.response.OrderResponse;
import com.dapp.backend.dto.response.PaymentResponse;
import com.dapp.backend.enums.OrderStatus;
import com.dapp.backend.enums.PaymentEnum;
import com.dapp.backend.enums.TypeTransactionEnum;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.*;
import com.dapp.backend.repository.OrderRepository;
import com.dapp.backend.repository.PaymentRepository;
import com.dapp.backend.repository.VaccineRepository;
import com.dapp.backend.util.DateTimeUtil;
import com.paypal.base.rest.PayPalRESTException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static com.dapp.backend.service.PaypalService.EXCHANGE_RATE_TO_USD;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final AuthService authService;
    private final OrderRepository orderRepository;
    private final VaccineRepository vaccineRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;

    @org.springframework.transaction.annotation.Transactional(rollbackFor = Exception.class)
    public PaymentResponse createOrder(OrderRequest request, String userAgent)
            throws AppException, PayPalRESTException {
        User user = authService.getCurrentUserLogin();
        Order order = new Order();
        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderRequest.ItemRequest item : request.getItems()) {
            Vaccine vaccine = vaccineRepository.findById(item.getId())
                    .orElseThrow(() -> new AppException("Vaccine not found"));

            if (vaccine.getStock() < item.getQuantity()) {
                throw new AppException("Not enough stock for vaccine: " + vaccine.getName());
            }
            vaccine.setStock(vaccine.getStock() - item.getQuantity());
            vaccineRepository.save(vaccine);

            OrderItem orderItem = new OrderItem();
            orderItem.setQuantity(item.getQuantity());
            orderItem.setVaccine(vaccine);
            orderItem.setOrder(order);
            orderItems.add(orderItem);
        }
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setOrderItems(orderItems);
        order.setTotalAmount(request.getTotalAmount());
        order.setItemCount(request.getItemCount());
        order.setStatus(OrderStatus.PENDING);
        orderRepository.save(order);

        Payment payment = new Payment();
        payment.setReferenceId(order.getOrderId());
        payment.setReferenceType(TypeTransactionEnum.ORDER);
        payment.setAmount(request.getTotalAmount());
        payment.setMethod(request.getPaymentMethod());

        if (request.getPaymentMethod().toString().equals("PAYPAL")) {
            payment.setAmount(request.getTotalAmount() * EXCHANGE_RATE_TO_USD);
        } else if (request.getPaymentMethod().toString().equals("METAMASK")) {
            payment.setAmount(request.getTotalAmount() / 200000.0);
        } else {
            payment.setAmount(request.getTotalAmount());
        }

        payment.setCurrency(request.getPaymentMethod().getCurrency());
        payment.setStatus(PaymentEnum.INITIATED);
        paymentRepository.save(payment);

        PaymentResponse response = new PaymentResponse();
        response.setReferenceId(order.getOrderId());
        response.setPaymentId(payment.getId());
        response.setMethod(payment.getMethod());

        switch (request.getPaymentMethod()) {
            case PAYPAL:
                String paypalUrl = paymentService.createPaypalUrl(request.getTotalAmount(), response.getReferenceId(),
                        response.getPaymentId(), TypeTransactionEnum.ORDER, userAgent);
                response.setPaymentURL(paypalUrl);
                break;
            case METAMASK:
                response.setAmount(request.getTotalAmount() / 200000.0);
                break;
            case CASH:
                payment.setStatus(PaymentEnum.PROCESSING);
                paymentRepository.save(payment);
                order.setStatus(OrderStatus.PROCESSING);
                orderRepository.save(order);
                break;
            default:
                break;
        }

        return response;
    }

    public List<OrderResponse> getOrder() throws AppException {
        User user = authService.getCurrentUserLogin();
        return orderRepository.findAllByUser(user).stream().map(this::toResponse).toList();
    }

    public OrderResponse toResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getOrderId());
        response.setOrderDate(DateTimeUtil.format(order.getOrderDate(), DateTimeUtil.DATE_FORMAT));
        response.setItemCount(order.getItemCount());
        response.setTotal(order.getTotalAmount());
        response.setStatus(order.getStatus());
        return response;
    }
}
