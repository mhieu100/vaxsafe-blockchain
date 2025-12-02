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
    Appointment appointment; // Null if reminderType = NEXT_DOSE_REMINDER

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user; // Người nhận reminder

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    ReminderType reminderType = ReminderType.APPOINTMENT_REMINDER;

    @Enumerated(EnumType.STRING)
    ReminderChannel channel; // EMAIL, SMS, ZALO

    LocalDate scheduledDate; // Ngày dự định gửi reminder

    LocalDateTime sentAt; // Thời điểm thực tế gửi

    @Enumerated(EnumType.STRING)
    @Builder.Default
    ReminderStatus status = ReminderStatus.PENDING;

    Integer daysBefore; // Số ngày trước lịch hẹn (cho APPOINTMENT_REMINDER)

    // For NEXT_DOSE_REMINDER only
    Long vaccineId; // Vaccine cần tiêm mũi tiếp theo
    Integer nextDoseNumber; // Mũi số mấy (2, 3, booster)

    String recipientEmail;

    String recipientPhone;

    String recipientZaloId;

    @Column(columnDefinition = "TEXT")
    String message;

    @Column(columnDefinition = "TEXT")
    String errorMessage; // Lỗi nếu gửi thất bại

    Integer retryCount; // Số lần thử lại

    LocalDateTime nextRetryAt; // Thời gian thử lại tiếp theo
}
