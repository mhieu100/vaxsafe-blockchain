package com.dapp.backend.enums;

public enum MethodPaymentEnum {
    METAMASK("ETH"),
    PAYPAL("USD"),
    BANK("VND"),
    CASH("VND");

    private final String currency;

    MethodPaymentEnum(String currency) {
        this.currency = currency;
    }

    public String getCurrency() {
        return currency;
    }
}

