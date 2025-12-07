package com.dapp.backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CenterResponse {
    Long centerId;
    String slug;
    String name;
    String image;
    String address;
    String phoneNumber;
    Integer capacity;
    String workingHours;
    Double latitude;
    Double longitude;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
