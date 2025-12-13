package com.dapp.backend.model;

import com.dapp.backend.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Entity
@Table(name = "family_members")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FamilyMember extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String fullName;
    LocalDate dateOfBirth;
    String relationship;
    String phone;
    Double heightCm;
    Double weightKg;

    @Column(unique = true)
    String identityNumber;

    String birthCertificateNumber;

    @Enumerated(EnumType.STRING)
    Gender gender;

    @Column(unique = true)
    String blockchainIdentityHash;

    @Column(unique = true)
    String did;

    String ipfsDataHash;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

}
