package com.dapp.backend.dto.mapper;

import com.dapp.backend.dto.response.BookingResponse;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.Booking;
import com.dapp.backend.model.FamilyMember;
import com.dapp.backend.model.User;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class BookingMapper {

    public static BookingResponse.AppointmentResponse toResponse(Appointment appointment) {
        if (appointment == null) {
            return null;
        }

        User doctor = appointment.getDoctor();
        User cashier = appointment.getCashier();

        return BookingResponse.AppointmentResponse.builder()
                .appointmentId(appointment.getId())
                .doseNumber(appointment.getDoseNumber())
                .scheduledDate(appointment.getScheduledDate())
                .scheduledTime(appointment.getScheduledTime())
                .centerId(appointment.getCenter().getId())
                .centerName(appointment.getCenter().getName())
                .doctorId(doctor != null ? doctor.getId() : null)
                .doctorName(doctor != null ? doctor.getFullName() : null)
                .cashierId(cashier != null ? cashier.getId() : null)
                .cashierName(cashier != null ? cashier.getFullName() : null)
                .appointmentStatus(appointment.getStatus())
                .build();
    }

    public static BookingResponse toResponse(Booking booking) {
        if (booking == null) {
            return null;
        }

        FamilyMember familyMember = booking.getFamilyMember();
        List<BookingResponse.AppointmentResponse> appointmentResponses = booking.getAppointments() != null
                ? booking.getAppointments().stream().map(BookingMapper::toResponse).collect(Collectors.toList())
                : Collections.emptyList();

        return BookingResponse.builder()
                .bookingId(booking.getBookingId())
                .patientId(booking.getPatient().getId())
                .patientName(booking.getPatient().getFullName())
                .familyMemberId(familyMember != null ? familyMember.getId() : null)
                .familyMemberName(familyMember != null ? familyMember.getFullName() : null)
                .vaccineName(booking.getVaccine().getName())
                .totalAmount(booking.getTotalAmount())
                .totalDoses(booking.getTotalDoses())
                .bookingStatus(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .appointments(appointmentResponses)
                .build();
    }
}
