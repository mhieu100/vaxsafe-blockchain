package com.dapp.backend.model;

import com.dapp.backend.enums.Gender;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String avatar;
    String fullName;
    @Column(unique = true, nullable = false)
    String email;
    String password;
    @Column(columnDefinition = "TEXT")
    String refreshToken;

    String phone;

    @Enumerated(EnumType.STRING)
    Gender gender;

    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate birthday;

    String address;

    @Column(unique = true)
    String blockchainIdentityHash;

    @Column(unique = true)
    String did;

    String ipfsDataHash;

    @ManyToOne
    @JoinColumn(name = "role_id")
    Role role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @EqualsAndHashCode.Exclude
    Patient patientProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @EqualsAndHashCode.Exclude
    Doctor doctor;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @EqualsAndHashCode.Exclude
    Cashier cashier;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @EqualsAndHashCode.Exclude
    List<FamilyMember> familyMembers;

    boolean isDeleted;

    @Column(nullable = false)
    @Builder.Default
    boolean isActive = false;

    @Column(nullable = false, columnDefinition = "boolean default true")
    @Builder.Default
    boolean newUser = true;
}
