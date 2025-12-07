package com.dapp.backend.dto.mapper;

import com.dapp.backend.dto.response.AppointmentResponse;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.User;

public class AppointmentMapper {

    public static AppointmentResponse toResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setDoseNumber(appointment.getDoseNumber());
        response.setScheduledTimeSlot(appointment.getScheduledTimeSlot());
        response.setActualScheduledTime(appointment.getActualScheduledTime());
        response.setScheduledDate(appointment.getScheduledDate());
        response.setDesiredDate(appointment.getDesiredDate());
        response.setDesiredTimeSlot(appointment.getDesiredTimeSlot());
        response.setRescheduleReason(appointment.getRescheduleReason());
        response.setRescheduledAt(appointment.getRescheduledAt());
        response.setStatus(appointment.getStatus());
        response.setBookingId(appointment.getBooking().getBookingId());
        response.setVaccineName(appointment.getBooking().getVaccine().getName());
        response.setCenterId(appointment.getCenter() != null ? appointment.getCenter().getCenterId() : null);
        response.setCenterName(appointment.getCenter() != null ? appointment.getCenter().getName() : null);

        // Get patient name and phone from either User or FamilyMember
        if (appointment.getBooking().getFamilyMember() != null) {
            response.setPatientName(appointment.getBooking().getFamilyMember().getFullName());
            response.setPatientPhone(appointment.getBooking().getFamilyMember().getPhone());
        } else {
            response.setPatientName(appointment.getBooking().getPatient().getFullName());
            response.setPatientPhone(appointment.getBooking().getPatient() != null
                    ? appointment.getBooking().getPatient().getPhone()
                    : null);

            if (appointment.getBooking().getPatient() != null
                    && appointment.getBooking().getPatient().getPatientProfile() != null) {
                response.setPatientId(appointment.getBooking().getPatient().getPatientProfile().getId());
            }
        }

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