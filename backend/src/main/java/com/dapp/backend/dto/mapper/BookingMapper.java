package com.dapp.backend.dto.mapper;
import com.dapp.backend.dto.response.AppointmentResponse;
import com.dapp.backend.dto.response.BookingResponse;
import com.dapp.backend.model.Booking;
import org.web3j.model.VaccineAppointment.Appointment;

import com.dapp.backend.dto.response.AppointmentDto;

import java.util.List;

public class BookingMapper {

    public static BookingResponse.AppointmentResponse toResponse(com.dapp.backend.model.Appointment appointment) {
        BookingResponse.AppointmentResponse response = new BookingResponse.AppointmentResponse();
        response.setId(appointment.getId());
        response.setDoseNumber(appointment.getDoseNumber());
        response.setScheduledTime(appointment.getScheduledTime());
        response.setScheduledDate(appointment.getScheduledDate());
        response.setStatus(appointment.getStatus());
        return response;
    }

    public static BookingResponse toResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setVaccineName(booking.getVaccine().getName());
        response.setCenterName(booking.getCenter().getName());
        response.setPatientName(booking.getPatient().getFullName());
        response.setTotalAmount(booking.getTotalAmount());
        response.setStatus(booking.getStatus());

        List<BookingResponse.AppointmentResponse> appointments = booking.getAppointments().stream().map(BookingMapper::toResponse).toList();

        response.setAppointments(appointments);
        return response;
    }
}