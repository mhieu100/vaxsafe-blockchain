package com.dapp.backend.enums;

public enum SlotStatus {
    AVAILABLE,  // Slot is free and can be booked
    BOOKED,     // Slot has an appointment
    BLOCKED     // Slot is unavailable (doctor busy with other tasks)
}
