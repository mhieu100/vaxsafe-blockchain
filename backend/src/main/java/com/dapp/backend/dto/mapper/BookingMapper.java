package com.dapp.backend.dto.mapper;

import com.dapp.backend.dto.response.BookingResponse;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.FamilyMember;
import com.dapp.backend.model.User;

import java.util.Collections;
import java.util.List;

public class BookingMapper {

    public static BookingResponse.AppointmentResponse toAppointmentResponse(Appointment appointment) {
        if (appointment == null) {
            return null;
        }

        User doctor = appointment.getDoctor();
        User cashier = appointment.getCashier();

        return BookingResponse.AppointmentResponse.builder()
                .appointmentId(appointment.getId())
                .doseNumber(appointment.getDoseNumber())
                .scheduledDate(appointment.getScheduledDate())
                .scheduledTimeSlot(appointment.getScheduledTimeSlot())
                .actualScheduledTime(appointment.getActualScheduledTime())
                .centerId(appointment.getCenter() != null ? appointment.getCenter().getCenterId() : null)
                .centerName(appointment.getCenter() != null ? appointment.getCenter().getName() : null)
                .doctorId(doctor != null ? doctor.getId() : null)
                .doctorName(doctor != null ? doctor.getFullName() : null)
                .cashierId(cashier != null ? cashier.getId() : null)
                .cashierName(cashier != null ? cashier.getFullName() : null)
                .appointmentStatus(appointment.getStatus())
                .build();
    }

    public static BookingResponse toResponse(Appointment appointment) {
        if (appointment == null) {
            return null;
        }

        FamilyMember familyMember = appointment.getFamilyMember();
        BookingResponse.AppointmentResponse appointmentResponse = toAppointmentResponse(appointment);
        List<BookingResponse.AppointmentResponse> appointmentResponses = Collections.singletonList(appointmentResponse);

        // Map AppointmentStatus to BookingEnum
        com.dapp.backend.enums.BookingEnum bookingStatus;
        if (appointment.getStatus() == com.dapp.backend.enums.AppointmentStatus.PENDING) {
            bookingStatus = com.dapp.backend.enums.BookingEnum.PENDING_PAYMENT;
        } else if (appointment.getStatus() == com.dapp.backend.enums.AppointmentStatus.CANCELLED) {
            bookingStatus = com.dapp.backend.enums.BookingEnum.CANCELLED;
        } else if (appointment.getStatus() == com.dapp.backend.enums.AppointmentStatus.COMPLETED) {
            bookingStatus = com.dapp.backend.enums.BookingEnum.COMPLETED;
        } else {
            bookingStatus = com.dapp.backend.enums.BookingEnum.CONFIRMED;
        }

        return BookingResponse.builder()
                .bookingId(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getFullName())
                .familyMemberId(familyMember != null ? familyMember.getId() : null)
                .familyMemberName(familyMember != null ? familyMember.getFullName() : null)
                .vaccineName(appointment.getVaccine().getName())
                .vaccineSlug(appointment.getVaccine().getSlug())
                .totalAmount(appointment.getTotalAmount())
                .totalDoses(1) // Always 1 now
                .vaccineTotalDoses(appointment.getVaccine().getDosesRequired())
                .bookingStatus(bookingStatus)
                .createdAt(appointment.getCreatedAt())
                .appointments(appointmentResponses)
                .build();
    }
}
