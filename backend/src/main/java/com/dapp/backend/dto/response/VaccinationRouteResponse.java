package com.dapp.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class VaccinationRouteResponse {
    private String routeId;
    private String vaccineName;
    private String vaccineSlug;
    private String patientName;
    private boolean isFamily;
    private int requiredDoses;
    private int cycleIndex;
    private LocalDateTime createdAt;
    private Double totalAmount;
    private String status; // COMPLETED, IN_PROGRESS, CANCELLED
    private int completedCount;
    private List<AppointmentResponse> appointments;
}
