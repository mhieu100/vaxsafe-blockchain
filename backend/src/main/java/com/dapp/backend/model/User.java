package com.dapp.backend.model;

import java.time.LocalDate;
import java.util.List;

import com.dapp.backend.enums.Gender;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
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
}
