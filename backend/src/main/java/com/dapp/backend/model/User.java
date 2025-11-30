package com.dapp.backend.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "users")
@Data
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
    @Column(nullable = true)
    String walletAddress;

    @ManyToOne
    @JoinColumn(name = "role_id")
    Role role;

    @ManyToOne
    @JoinColumn(name = "center_id")
    Center center;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    Patient patientProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    Doctor doctor;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<FamilyMember> familyMembers = new ArrayList<>();

    boolean isDeleted;
    
    @Column(nullable = false)
    @Builder.Default
    boolean isActive = false;
}
