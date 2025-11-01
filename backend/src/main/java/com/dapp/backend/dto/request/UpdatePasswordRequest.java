package com.dapp.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdatePasswordRequest {
    @NotBlank(message = "email not empty")
    String email;
    @NotBlank(message = "old password not empty")
    String oldPassword;
    @NotBlank(message = "username not empty")
    String newPassword;
}
