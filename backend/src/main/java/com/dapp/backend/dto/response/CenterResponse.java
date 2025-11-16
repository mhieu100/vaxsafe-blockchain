package com.dapp.backend.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CenterResponse {
    Long id;
    String slug;
    String name;
    String image;
    String address;
    String phoneNumber;
    Integer capacity;
    String workingHours;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
