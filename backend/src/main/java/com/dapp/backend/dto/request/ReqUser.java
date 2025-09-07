package com.dapp.backend.dto.request;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ReqUser {
    private String email;
    private String fullName;
    private String phoneNumber;
    private LocalDate birthday;
    private String address;
    private String centerName; // tên trung tâm để map sang entity Center
}

