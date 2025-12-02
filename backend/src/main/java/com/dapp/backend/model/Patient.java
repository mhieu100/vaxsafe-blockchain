package com.dapp.backend.model;

import com.dapp.backend.enums.BloodType;
import com.dapp.backend.enums.Gender;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    long id;
    
    @Column(unique = true)
    String identityNumber;
    
    @Enumerated(EnumType.STRING)
    BloodType bloodType;
    Double heightCm;
    Double weightKg;
    String occupation;
    String lifestyleNotes;
    String insuranceNumber;
    boolean consentForAIAnalysis;

    @OneToOne
    @JoinColumn(name = "user_id")
    @EqualsAndHashCode.Exclude
    private User user;

}