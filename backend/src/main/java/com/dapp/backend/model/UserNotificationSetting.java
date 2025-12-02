package com.dapp.backend.model;

import com.dapp.backend.enums.ReminderChannel;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * User preferences for notification channels
 */
@Entity
@Table(name = "user_notification_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserNotificationSetting extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    User user;

    @Builder.Default
    Boolean emailEnabled = true;

    @Builder.Default
    Boolean smsEnabled = false;

    @Builder.Default
    Boolean zaloEnabled = false;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    ReminderChannel preferredChannel = ReminderChannel.EMAIL;

    @Builder.Default
    Boolean appointmentReminderEnabled = true;

    @Builder.Default
    Boolean nextDoseReminderEnabled = true;
}
