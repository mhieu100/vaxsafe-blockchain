package com.dapp.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class CenterAvailabilityResponse {
    private LocalDate date;
    private Long centerId;
    private List<SlotAvailabilityDto> slots;
}
