package com.dapp.backend.dto.request;

import com.dapp.backend.enums.MethodPaymentEnum;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderRequest {
    List<ItemRequest> items;
    int itemCount;
    double totalAmount;
    MethodPaymentEnum paymentMethod;

    @Data
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class ItemRequest {
        long id;
        int quantity;
    }
}
