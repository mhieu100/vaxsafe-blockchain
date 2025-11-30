package com.dapp.backend.model;

import com.dapp.backend.enums.AppointmentEnum;
import com.dapp.backend.enums.TimeSlotEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
    TimeSlotEnum scheduledTimeSlot; // Khung giờ dự kiến (2 tiếng, vd: 7:00-9:00)
    
    @Column(name = "actual_scheduled_time")
    java.time.LocalTime actualScheduledTime; // Giờ chính thức cụ thể (15 phút, do Cashier set)

    // Fields for reschedule functionality
    LocalDate desiredDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "desired_time_slot")
    TimeSlotEnum desiredTimeSlot; // Khung giờ muốn đổi
    
    
    
    String rescheduleReason;
    LocalDateTime rescheduledAt;

    @Enumerated(EnumType.STRING)
    AppointmentEnum status;
}