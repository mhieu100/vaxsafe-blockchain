package com.dapp.backend.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RegisterRequest {
    @NotBlank(message = "full name not empty")
    String fullName;
    @NotBlank(message = "email not empty")
    @Email
    String email;
    @NotBlank(message = "password not empty")
    String password;
}
