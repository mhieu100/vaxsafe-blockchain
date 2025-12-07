package com.dapp.backend.dto.request;

import com.dapp.backend.enums.ObservationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ObservationRequest {

    // Removed patientId because it will probably be taken from the context or
    // identifying parameters
    // But for flexibility, let's keep it optional or handled by the service.
    // Wait, usually the patient ID comes from the path variable or the logged-in
    // user.
    // For now, let's assume the endpoints will be
    // /patients/{patientId}/observations or similar.
    // So patientId is not needed in the body if it's in the path.
    // However, if the logged-in user (patient) creates it, they don't need to send
    // patientId.
    // If a doctor creates it, they might need to specify.

    @NotNull(message = "TYPE_REQUIRED")
    ObservationType type;

    @NotBlank(message = "VALUE_REQUIRED")
    String value;

    String unit;

    String note;

    Long appointmentId;
}
