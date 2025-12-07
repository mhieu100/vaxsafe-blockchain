package com.dapp.backend.model;

import com.dapp.backend.enums.ObservationType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "observations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Observation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    Patient patient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ObservationType type;

    @Column(nullable = false)
    String value; // Lưu giá trị: "60.5", "37.5", "Sưng nhẹ", "120/80"

    String unit; // "kg", "cm", "°C", "mmHg", "bpm"

    @Column(columnDefinition = "TEXT")
    String note; // Ghi chú thêm: "Đo sau ăn", "Phản ứng xuất hiện sau 30p"

    @Column(nullable = false)
    LocalDateTime recordedAt;

    // Optional: Reference to specific appointment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    Appointment appointment;
}
