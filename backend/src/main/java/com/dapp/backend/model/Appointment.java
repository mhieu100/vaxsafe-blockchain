package com.dapp.backend.model;

import com.dapp.backend.util.AppointmentEnum;
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

    Integer doseNumber;
    LocalDate scheduledDate;
    LocalTime scheduledTime;

    @Enumerated(EnumType.STRING)
    AppointmentEnum status;
}