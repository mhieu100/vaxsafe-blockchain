package com.dapp.backend.dto.mapper;
import org.web3j.model.VaccineAppointment.Appointment;

import com.dapp.backend.dto.response.AppointmentDto;

public class AppointmentMapper {

    public static AppointmentDto toDto(Appointment appointment) {
        AppointmentDto dto = new AppointmentDto();
        dto.setAppointmentId(appointment.appointmentId);
        dto.setVaccineName(appointment.vaccineName);
        dto.setPatientAddress(appointment.patientAddress);
        dto.setDoctorAddress(appointment.doctorAddress);
        dto.setCashierAddress(appointment.cashierAddress);
        dto.setCenterName(appointment.centerName);
        dto.setDate(appointment.date);
        dto.setTime(appointment.time);
        dto.setPrice(appointment.price.intValue());
        dto.setStatus(appointment.status);
        return dto;
    }
}