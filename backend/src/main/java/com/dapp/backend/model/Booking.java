package com.dapp.backend.model;

import com.dapp.backend.util.BookingEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    User patient;

    @ManyToOne
    @JoinColumn(name = "vaccine_id", nullable = false)
    Vaccine vaccine;

    @ManyToOne
    @JoinColumn(name = "center_id", nullable = false)
    Center center;

    Double totalAmount;
    @Enumerated(EnumType.STRING)
    BookingEnum status;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    List<Appointment> appointments = new ArrayList<>();
}
