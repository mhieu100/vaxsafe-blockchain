package com.dapp.backend.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.dapp.backend.model.Appointment;
import com.dapp.backend.util.MethodPaymentEnum;
import lombok.Data;

@Data
public class AppointmentRequest {
    private long centerId;
    private long vaccineId;
    private LocalDate firstDoseDate;
    private LocalTime time;
    private double amount;
    private List<DoseSchedule> doseSchedules;
    private MethodPaymentEnum method;

    @Data
    public static class DoseSchedule {
        private LocalDate date;
        private LocalTime time;
    }
}
