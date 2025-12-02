package com.dapp.backend.enums;

/**
 * Types of vaccination reminders
 */
public enum ReminderType {
    APPOINTMENT_REMINDER,  // Nhắc lịch hẹn đã book (Mũi 1 hoặc bất kỳ mũi nào đã đặt)
    NEXT_DOSE_REMINDER    // Nhắc mũi tiếp theo (Mũi 2, 3, Booster) dựa trên phác đồ vaccine
}
