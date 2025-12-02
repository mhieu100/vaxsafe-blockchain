package com.dapp.backend.repository;

import com.dapp.backend.model.VaccineRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VaccineRecordRepository extends JpaRepository<VaccineRecord, Long> {

    // Find all records for a user (adult)
    List<VaccineRecord> findByUserIdOrderByVaccinationDateDesc(Long userId);

    // Find all records for a family member (child)
    List<VaccineRecord> findByFamilyMemberIdOrderByVaccinationDateDesc(Long familyMemberId);

    // Find by appointment
    Optional<VaccineRecord> findByAppointmentId(Long appointmentId);

    // Find by blockchain identity hash
    Optional<VaccineRecord> findByPatientIdentityHash(String identityHash);

    // Find all records for a specific vaccine
    List<VaccineRecord> findByVaccineId(Long vaccineId);

    // Find records by blockchain transaction hash
    Optional<VaccineRecord> findByTransactionHash(String txHash);

    // Find verified records
    List<VaccineRecord> findByIsVerifiedTrue();

    // Find unverified records
    List<VaccineRecord> findByIsVerifiedFalse();

    // Get vaccine history for a patient (user or family member)
    @Query("""
        SELECT vr FROM VaccineRecord vr 
        WHERE (vr.user.id = :userId OR vr.familyMember.id = :familyMemberId)
        ORDER BY vr.vaccinationDate DESC
        """)
    List<VaccineRecord> findVaccineHistory(
            @Param("userId") Long userId,
            @Param("familyMemberId") Long familyMemberId
    );

    // Count total vaccinations for a user
    long countByUserId(Long userId);

    // Count total vaccinations for a family member
    long countByFamilyMemberId(Long familyMemberId);

    // Find records that need follow-up
    @Query("""
        SELECT vr FROM VaccineRecord vr 
        WHERE vr.followUpDate IS NOT NULL 
        AND vr.followUpDate <= CURRENT_DATE
        AND vr.center.id = :centerId
        """)
    List<VaccineRecord> findRecordsNeedingFollowUp(@Param("centerId") Long centerId);

    // Find records by doctor
    List<VaccineRecord> findByDoctor_IdOrderByVaccinationDateDesc(Long doctorId);

    // Find records by center (Note: Center uses centerId instead of id)
    List<VaccineRecord> findByCenter_CenterIdOrderByVaccinationDateDesc(Long centerId);
}
