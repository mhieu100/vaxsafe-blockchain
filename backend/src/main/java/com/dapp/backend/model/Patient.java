package com.dapp.backend.model;

import com.dapp.backend.enums.BloodType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Patient extends BaseEntity {

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