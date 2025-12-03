package com.dapp.backend.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "doctors")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "doctor_id")
    Long doctorId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @EqualsAndHashCode.Exclude
    User user;

    @ManyToOne
    @JoinColumn(name = "center_id", nullable = false)
    Center center;

    @Column(name = "license_number", unique = true, length = 50)
    String licenseNumber;

    @Column(length = 100)
    String specialization;

    @Column(name = "consultation_duration")
    @Builder.Default
    Integer consultationDuration = 30; // Default 30 minutes per slot

    @Column(name = "max_patients_per_day")
    @Builder.Default
    Integer maxPatientsPerDay = 20;

    @Column(name = "is_available")
    @Builder.Default
    Boolean isAvailable = true;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @EqualsAndHashCode.Exclude
    List<DoctorSchedule> schedules = new ArrayList<>();

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @EqualsAndHashCode.Exclude
    List<DoctorAvailableSlot> availableSlots = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
