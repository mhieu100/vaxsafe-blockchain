package com.dapp.backend.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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
    String fullName;
    String email;
    String password;
    String phoneNumber;
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate birthday;
    String address;
    boolean isDeleted;
    @ManyToOne
    @JoinColumn(name = "center_id")
    Center center;
    @ManyToOne
    @JoinColumn(name = "role_id")
    Role role;

    @Column(columnDefinition = "TEXT")
    String refreshToken;

    @Column(nullable = true)
    String walletAddress;
}
