package com.dapp.backend.model;

import com.dapp.backend.enums.BookingEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
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
    Long bookingId;

    Integer totalDoses;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    User patient;

    @ManyToOne
    @JoinColumn(name = "family_member_id")
    FamilyMember familyMember;

    @ManyToOne
    @JoinColumn(name = "vaccine_id", nullable = false)
    Vaccine vaccine;

    Double totalAmount;
    @Enumerated(EnumType.STRING)
    BookingEnum status;

    @CreationTimestamp
    LocalDateTime createdAt;

    @OneToMany(mappedBy = "booking", orphanRemoval = true, cascade = CascadeType.ALL)
    List<Appointment> appointments = new ArrayList<>();
}
