package com.dapp.backend.dto.response;

import com.dapp.backend.enums.ObservationType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ObservationResponse {
    Long id;
    Long patientId;
    ObservationType type;
    String value;
    String unit;
    String note;
    LocalDateTime recordedAt;
}
