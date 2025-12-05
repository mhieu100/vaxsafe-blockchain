package com.dapp.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDashboardStatsResponse {
    private long todayAppointments;
    private long weekAppointments;
    private long weekCompleted;
    private long weekCancelled;
    private long weekInProgress;
    private long monthCompleted;
    private double rating;
    private NextAppointmentInfo nextAppointment;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NextAppointmentInfo {
        private String time;
        private String patientName;
        private String vaccineName;
    }
}
