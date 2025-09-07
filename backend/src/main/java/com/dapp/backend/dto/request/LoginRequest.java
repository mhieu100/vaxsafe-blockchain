package com.dapp.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "username not empty")
    @Email
    private String username;
    @NotBlank(message = "password not empty")
    private String password;
}
