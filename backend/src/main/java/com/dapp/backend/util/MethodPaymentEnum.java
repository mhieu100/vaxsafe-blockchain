package com.dapp.backend.util;

public enum MethodPaymentEnum {
    METAMASK("ETH"),
    PAYPAL("USD"),
    ATM("VND"),
    CASH("VND");

    private final String currency;

    MethodPaymentEnum(String currency) {
        this.currency = currency;
    }

    public String getCurrency() {
        return currency;
    }
}

