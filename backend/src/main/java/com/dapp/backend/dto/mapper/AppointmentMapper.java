package com.dapp.backend.dto.mapper;
import com.dapp.backend.dto.response.AppointmentResponse;
import com.dapp.backend.model.Appointment;

public class AppointmentMapper {

    public static AppointmentResponse toResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setDoseNumber(appointment.getDoseNumber());
        response.setScheduledTime(appointment.getScheduledTime());
        response.setScheduledDate(appointment.getScheduledDate());
        response.setStatus(appointment.getStatus());
        response.setBookingId(appointment.getBooking().getBookingId());
        response.setVaccineName(appointment.getBooking().getVaccine().getName());
        response.setCenterName(appointment.getCenter().getName());
        response.setPatientName(appointment.getBooking().getPatient().getFullName());
        response.setCashierName(appointment.getCashier().getFullName());
        response.setDoctorName(appointment.getDoctor().getFullName());
        return response;
    }


}