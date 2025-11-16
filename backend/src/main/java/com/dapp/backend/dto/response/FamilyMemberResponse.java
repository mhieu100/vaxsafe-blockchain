package com.dapp.backend.dto.response;

import com.dapp.backend.enums.Gender;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMemberResponse {

    private long id;
    private String fullName;
    private LocalDate dateOfBirth;
    private String relationship;
    private String phone;
    private Gender gender;
    private long parentId;
    private String identityNumber;
}