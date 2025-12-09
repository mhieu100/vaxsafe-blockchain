package com.dapp.backend.model;

import com.dapp.backend.enums.AppointmentStatus;
import com.dapp.backend.enums.TimeSlotEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Appointment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    User patient;

    @ManyToOne
    @JoinColumn(name = "family_member_id")
    FamilyMember familyMember;

    @ManyToOne
    @JoinColumn(name = "vaccine_id")
    Vaccine vaccine;

    @ManyToOne
    @JoinColumn(name = "course_id")
    VaccinationCourse vaccinationCourse;

    Double totalAmount;

    @ManyToOne
    @JoinColumn(name = "cashier_id")
    User cashier;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    User doctor;

    @OneToOne
    @JoinColumn(name = "slot_id")
    DoctorAvailableSlot slot;

    @ManyToOne
    @JoinColumn(name = "center_id")
    Center center;

    Integer doseNumber;
    LocalDate scheduledDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "scheduled_time_slot")
    TimeSlotEnum scheduledTimeSlot;

    @Column(name = "actual_scheduled_time")
    LocalTime actualScheduledTime;

    LocalDate desiredDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "desired_time_slot")
    TimeSlotEnum desiredTimeSlot;

    LocalDateTime rescheduledAt;

    @Enumerated(EnumType.STRING)
    AppointmentStatus status;

    LocalDate vaccinationDate;
}