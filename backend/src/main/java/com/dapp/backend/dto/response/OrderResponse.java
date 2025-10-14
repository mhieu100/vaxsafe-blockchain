package com.dapp.backend.dto.response;

import com.dapp.backend.enums.OrderStatus;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {
    Long orderId;
    String orderDate;
    OrderStatus status;
    int itemCount;
    double total;
}
