package com.dapp.backend.dto.response;

import com.dapp.backend.enums.TimeSlotEnum;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SlotAvailabilityDto {
    private TimeSlotEnum timeSlot;
    private String time;
    private int capacity;
    private int booked;
    private int available;
    private String status; // AVAILABLE, FULL
}
