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
        response.setBookingId(appointment.getBooking().getId());
        response.setVaccineName(appointment.getBooking().getVaccine().getName());
        response.setCenterName(appointment.getBooking().getCenter().getName());
        response.setUsername(appointment.getBooking().getUser().getFullName());
        return response;
    }


}