package com.dapp.backend.enums;

public enum ObservationType {
    BODY_WEIGHT, // Cân nặng
    BODY_HEIGHT, // Chiều cao
    BODY_TEMPERATURE, // Nhiệt độ cơ thể
    BLOOD_PRESSURE, // Huyết áp
    HEART_RATE, // Nhịp tim
    REMOVE_REACTION, // Phản ứng sau tiêm (Sưng, sốt, ...)
    SYMPTOM, // Triệu chứng bất thường khác
    MEDICAL_HISTORY // Tiền sử bệnh lý (nếu muốn lưu dạng observation theo thời gian)
}
