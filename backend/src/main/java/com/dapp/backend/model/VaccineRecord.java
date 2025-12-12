package com.dapp.backend.model;

import com.dapp.backend.enums.VaccinationSite;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vaccine_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(callSuper = true)
public class VaccineRecord extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    @ManyToOne
    @JoinColumn(name = "family_member_id")
    FamilyMember familyMember;

    String patientName;
    String patientIdentityHash;

    @ManyToOne
    @JoinColumn(name = "vaccine_id", nullable = false)
    Vaccine vaccine;

    Integer doseNumber;

    String manufacturer;

    LocalDate vaccinationDate;

    @Enumerated(EnumType.STRING)
    VaccinationSite site;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    User doctor;

    @ManyToOne
    @JoinColumn(name = "center_id", nullable = false)
    Center center;

    @OneToOne
    @JoinColumn(name = "appointment_id")
    Appointment appointment;

    Double height;
    Double weight;
    Double temperature;
    Integer pulse;

    @Column(columnDefinition = "TEXT")
    String notes;

    @Column(columnDefinition = "TEXT")
    String adverseReactions;

    LocalDateTime followUpDate;

    String blockchainRecordId;

    @Column(unique = true)
    String transactionHash;

    Long blockNumber;

    String ipfsHash;

    @Column(columnDefinition = "TEXT")
    String digitalSignature;

    boolean isVerified;

    LocalDateTime verifiedAt;

    LocalDate nextDoseDate;

    Integer nextDoseNumber;
}
