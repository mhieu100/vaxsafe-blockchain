package com.dapp.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CenterRequest {
    // Slug will be auto-generated from name, but can be provided if needed
    String slug;

    @NotBlank(message = "Center name is required")
    String name;

    String image;

    @NotBlank(message = "Address is required")
    String address;

    String phoneNumber;

    @NotNull(message = "Capacity is required")
    @Positive(message = "Capacity must be positive")
    Integer capacity;

    @NotBlank(message = "Working hours is required")
    String workingHours;

    Double latitude;
    Double longitude;
}
