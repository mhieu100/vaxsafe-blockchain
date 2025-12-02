package com.dapp.backend.enums;

public enum VaccinationSite {
    LEFT_ARM("Cánh tay trái"),
    RIGHT_ARM("Cánh tay phải"),
    LEFT_THIGH("Đùi trái"),
    RIGHT_THIGH("Đùi phải"),
    ORAL("Uống"),
    NASAL("Xịt mũi");

    private final String vietnameseName;

    VaccinationSite(String vietnameseName) {
        this.vietnameseName = vietnameseName;
    }

    public String getVietnameseName() {
        return vietnameseName;
    }
}
