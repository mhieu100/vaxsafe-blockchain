package com.dapp.backend.dto.mapper;
import com.dapp.backend.dto.response.AppointmentResponse;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.User;

public class AppointmentMapper {

    public static AppointmentResponse toResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setDoseNumber(appointment.getDoseNumber());
        response.setScheduledTime(appointment.getScheduledTime());
        response.setScheduledDate(appointment.getScheduledDate());
        response.setDesiredDate(appointment.getDesiredDate());
        response.setDesiredTime(appointment.getDesiredTime());
        response.setRescheduleReason(appointment.getRescheduleReason());
        response.setRescheduledAt(appointment.getRescheduledAt());
        response.setStatus(appointment.getStatus());
        response.setBookingId(appointment.getBooking().getBookingId());
        response.setVaccineName(appointment.getBooking().getVaccine().getName());
        response.setCenterName(appointment.getCenter().getName());
        response.setPatientName(appointment.getBooking().getPatient().getFullName());

        User cashier = appointment.getCashier();
        if (cashier != null) {
            response.setCashierName(cashier.getFullName());
        }

        User doctor = appointment.getDoctor();
        if (doctor != null) {
            response.setDoctorName(doctor.getFullName());
        }

        return response;
    }


}