package com.dapp.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashierDashboardStatsResponse {
    private long urgentAppointments;
    private long todayAppointments;
    private long weekCompleted;
    private long weekCancelled;
}
