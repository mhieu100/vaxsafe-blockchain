package com.dapp.backend.dto.response;


import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoginResponse {
    String accessToken;
    UserLogin user;

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class UserLogin {
        Long id;
        String fullName;
        String email;
        String phoneNumber;
        LocalDate birthday;
        String address;
        boolean isDeleted;
        String centerName;
        String role;
        String walletAddress;
    }
}