package com.dapp.backend.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Data;

@Data
public class ReqAppointment {
    private long centerId;
    private long vaccineId;
    private LocalDate date;
    private LocalTime time;
    private int price;
}
