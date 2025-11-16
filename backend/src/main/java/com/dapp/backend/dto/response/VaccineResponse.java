package com.dapp.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VaccineResponse {
    Long id;
    String slug;
    String name;
    String country;
    String image;
    Integer price;
    Integer stock;
    String descriptionShort;
    String description;
    String manufacturer;
    List<String> injection;
    List<String> preserve;
    List<String> contraindications;
    Integer dosesRequired;
    Integer duration; // duration in days/months depending on business rule
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
