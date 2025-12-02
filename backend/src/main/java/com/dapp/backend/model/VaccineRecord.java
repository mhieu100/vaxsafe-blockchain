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
public class VaccineRecord extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    // Patient Information (Either User or FamilyMember)
    @ManyToOne
    @JoinColumn(name = "user_id")
    User user; // For adult patients
    
    @ManyToOne
    @JoinColumn(name = "family_member_id")
    FamilyMember familyMember; // For children
    
    String patientName; // Denormalized for quick access
    String patientIdentityHash; // blockchainIdentityHash from User or FamilyMember

    // Vaccine Information
    @ManyToOne
    @JoinColumn(name = "vaccine_id", nullable = false)
    Vaccine vaccine;
    
    Integer doseNumber; // Mũi thứ mấy (1, 2, 3...)
    
    String lotNumber; // Số lô vaccine
    
    LocalDate expiryDate; // Hạn sử dụng của lô vaccine
    
    String manufacturer; // Nhà sản xuất

    // Vaccination Details
    LocalDate vaccinationDate; // Ngày tiêm thực tế
    
    @Enumerated(EnumType.STRING)
    VaccinationSite site; // Vị trí tiêm
    
    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    User doctor; // Bác sĩ thực hiện
    
    @ManyToOne
    @JoinColumn(name = "center_id", nullable = false)
    Center center; // Trung tâm tiêm chủng

    // Related Appointment
    @OneToOne
    @JoinColumn(name = "appointment_id")
    Appointment appointment;

    // Medical Information
    @Column(columnDefinition = "TEXT")
    String notes; // Ghi chú về phản ứng sau tiêm, tình trạng sức khỏe
    
    @Column(columnDefinition = "TEXT")
    String adverseReactions; // Phản ứng phụ nếu có
    
    LocalDateTime followUpDate; // Ngày tái khám (nếu cần)

    // Blockchain Integration
    String blockchainRecordId; // Record ID trên blockchain smart contract
    
    @Column(unique = true)
    String transactionHash; // Transaction hash khi lưu lên blockchain
    
    Long blockNumber; // Block number chứa transaction
    
    String ipfsHash; // IPFS hash chứa chi tiết record (có thể bao gồm ảnh, chữ ký điện tử)
    
    @Column(columnDefinition = "TEXT")
    String digitalSignature; // Chữ ký số của bác sĩ
    
    boolean isVerified; // Đã verify trên blockchain chưa
    
    LocalDateTime verifiedAt; // Thời điểm verify

    // Next Dose Information
    LocalDate nextDoseDate; // Ngày dự kiến tiêm mũi tiếp theo
    
    Integer nextDoseNumber; // Mũi tiếp theo
}
