package com.dapp.backend.enums;

public enum PaymentMethod {
    METAMASK("ETH"),
    PAYPAL("USD"),
    BANK("VND"),
    CASH("VND");

    private final String currency;

    PaymentMethod(String currency) {
        this.currency = currency;
    }

    public String getCurrency() {
        return currency;
    }
}

