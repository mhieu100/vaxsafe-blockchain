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

        response.setRescheduledAt(appointment.getRescheduledAt());
        response.setAppointmentStatus(appointment.getStatus());
        response.setVaccineName(appointment.getVaccine().getName());
        response.setVaccineSlug(appointment.getVaccine().getSlug());
        if (appointment.getVaccinationCourse() != null) {
            response.setVaccinationCourseId(appointment.getVaccinationCourse().getId());
        }

        response.setVaccineTotalDoses(appointment.getVaccine().getDosesRequired());
        response.setCreatedAt(appointment.getCreatedAt());
        response.setCenterId(appointment.getCenter() != null ? appointment.getCenter().getCenterId() : null);
        response.setCenterName(appointment.getCenter() != null ? appointment.getCenter().getName() : null);

        if (appointment.getFamilyMember() != null) {
            response.setPatientName(appointment.getFamilyMember().getFullName());
            response.setPatientPhone(appointment.getFamilyMember().getPhone());
            response.setFamilyMemberId(appointment.getFamilyMember().getId());
        } else {
            response.setPatientName(appointment.getPatient().getFullName());
            response.setPatientPhone(appointment.getPatient() != null
                    ? appointment.getPatient().getPhone()
                    : null);

            if (appointment.getPatient() != null
                    && appointment.getPatient().getPatientProfile() != null) {
                response.setPatientId(appointment.getPatient().getPatientProfile().getId());
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

    public static void mapPaymentToResponse(AppointmentResponse response, com.dapp.backend.model.Payment payment) {
        if (payment != null) {
            response.setPaymentId(payment.getId());
            response.setPaymentStatus(payment.getStatus() != null ? payment.getStatus().name() : null);
            response.setPaymentMethod(payment.getMethod() != null ? payment.getMethod().name() : null);
            response.setPaymentAmount(payment.getAmount());
        }
    }
}