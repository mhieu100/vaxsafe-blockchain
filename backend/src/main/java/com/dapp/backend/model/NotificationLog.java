package com.dapp.backend.model;

import com.dapp.backend.enums.ReminderChannel;
import com.dapp.backend.enums.ReminderStatus;
import com.dapp.backend.enums.ReminderType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;


@Entity
@Table(name = "notification_logs", indexes = {
    @Index(name = "idx_user_type_sent", columnList = "user_id,reminder_type,sent_at"),
    @Index(name = "idx_appointment_channel", columnList = "appointment_id,channel"),
    @Index(name = "idx_sent_at", columnList = "sent_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne
    @JoinColumn(name = "appointment_id")
    Appointment appointment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ReminderType reminderType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ReminderChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ReminderStatus status;

    @Column(nullable = false)
    LocalDateTime sentAt;

    String recipient;

    @Column(columnDefinition = "TEXT")
    String content;

    @Column(columnDefinition = "TEXT")
    String errorMessage;

    Integer doseNumber;

    Long vaccineId;
}
