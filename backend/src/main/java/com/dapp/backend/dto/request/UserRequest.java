package com.dapp.backend.dto.request;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserRequest {
    long id;
    String email;
    String fullName;
    

    String phone;
    LocalDate birthday;
    String address;
}

