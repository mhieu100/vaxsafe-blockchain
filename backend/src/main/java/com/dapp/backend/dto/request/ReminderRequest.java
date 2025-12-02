package com.dapp.backend.dto.request;

import com.dapp.backend.enums.ReminderChannel;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReminderRequest {
    Long appointmentId;
    Set<ReminderChannel> channels; // EMAIL, SMS, ZALO
    LocalDate reminderDate;
    Integer daysBefore;
}
