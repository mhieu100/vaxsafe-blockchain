package com.dapp.backend.model;

import com.dapp.backend.enums.ReminderChannel;
import com.dapp.backend.enums.ReminderStatus;
import com.dapp.backend.enums.ReminderType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vaccination_reminders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VaccinationReminder extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "appointment_id")
    Appointment appointment;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    ReminderType reminderType = ReminderType.APPOINTMENT_REMINDER;

    @Enumerated(EnumType.STRING)
    ReminderChannel channel;

    LocalDate scheduledDate;

    LocalDateTime sentAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    ReminderStatus status = ReminderStatus.PENDING;

    Integer daysBefore;


    Long vaccineId;
    Integer nextDoseNumber;

    String recipientEmail;

    String recipientPhone;

    String recipientZaloId;

    @Column(columnDefinition = "TEXT")
    String message;

    @Column(columnDefinition = "TEXT")
    String errorMessage;

    Integer retryCount;

    LocalDateTime nextRetryAt;
}
