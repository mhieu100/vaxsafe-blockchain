package com.dapp.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalPatients;
    private long totalDoctors;
    private long totalCenters;
    private long totalVaccines;


    private long pendingAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long totalAppointments;


    private List<DailyStat> dailyAppointments;
    private Map<String, Long> vaccineDistribution;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyStat {
        private String date;
        private long count;
    }
}
