package com.dapp.backend.enums;

import lombok.Getter;

/**
 * Time slot enum for appointment scheduling
 * Each slot represents a 2-hour window for patient scheduling
 * Within each time slot, doctors have 30-minute consultation slots
 * 
 * Example: SLOT_11_00 (11:00 - 13:00) contains:
 * - 11:00-11:30, 11:30-12:00, 12:00-12:30, 12:30-13:00
 */
@Getter
public enum TimeSlotEnum {
    SLOT_07_00("07:00", "7:00 - 9:00"),
    SLOT_09_00("09:00", "9:00 - 11:00"),
    SLOT_11_00("11:00", "11:00 - 13:00"),
    SLOT_13_00("13:00", "13:00 - 15:00"),
    SLOT_15_00("15:00", "15:00 - 17:00");

    private final String time;
    private final String displayName;

    TimeSlotEnum(String time, String displayName) {
        this.time = time;
        this.displayName = displayName;
    }

    public static TimeSlotEnum fromTime(String time) {
        for (TimeSlotEnum slot : TimeSlotEnum.values()) {
            if (slot.time.equals(time)) {
                return slot;
            }
        }
        throw new IllegalArgumentException("Invalid time slot: " + time);
    }
}
