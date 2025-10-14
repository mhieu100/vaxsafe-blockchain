package com.dapp.backend.model;

import com.dapp.backend.enums.AppointmentEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    Booking booking;

    @ManyToOne
    @JoinColumn(name = "cashier_id")
    User cashier;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    User doctor;

    @ManyToOne
    @JoinColumn(name = "center_id", nullable = false)
    Center center;

    Integer doseNumber;
    LocalDate scheduledDate;
    LocalTime scheduledTime;

    @Enumerated(EnumType.STRING)
    AppointmentEnum status;
}