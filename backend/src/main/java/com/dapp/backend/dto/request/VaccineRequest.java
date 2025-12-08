package com.dapp.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VaccineRequest {


    String slug;

    @NotBlank(message = "Vaccine name is required")
    String name;

    @NotBlank(message = "Country is required")
    String country;

    String image;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be non-negative")
    Integer price;

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock must be non-negative")
    Integer stock;

    String descriptionShort;
    String description;
    String manufacturer;

    List<String> injection;
    List<String> preserve;
    List<String> contraindications;

    @NotNull(message = "Doses required is mandatory")
    @Min(value = 1, message = "At least 1 dose is required")
    Integer dosesRequired;

    @NotNull(message = "Duration is required")
    @Min(value = 0, message = "Duration must be non-negative")
    Integer duration;
}

