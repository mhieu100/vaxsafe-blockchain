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

    List<VaccineRecord> findByUserIdOrderByVaccinationDateDesc(Long userId);

    List<VaccineRecord> findByFamilyMemberIdOrderByVaccinationDateDesc(Long familyMemberId);

    Optional<VaccineRecord> findByAppointmentId(Long appointmentId);

    Optional<VaccineRecord> findByPatientIdentityHash(String identityHash);

    List<VaccineRecord> findByVaccineId(Long vaccineId);

    Optional<VaccineRecord> findByTransactionHash(String txHash);

    List<VaccineRecord> findByIsVerifiedTrue();

    List<VaccineRecord> findByIsVerifiedFalse();

    @Query("""
            SELECT vr FROM VaccineRecord vr
            WHERE (vr.user.id = :userId OR vr.familyMember.id = :familyMemberId)
            ORDER BY vr.vaccinationDate DESC
            """)
    List<VaccineRecord> findVaccineHistory(
            @Param("userId") Long userId,
            @Param("familyMemberId") Long familyMemberId);

    long countByUserId(Long userId);

    long countByFamilyMemberId(Long familyMemberId);

    @Query("""
            SELECT vr FROM VaccineRecord vr
            WHERE vr.followUpDate IS NOT NULL
            AND vr.followUpDate <= CURRENT_DATE
            AND vr.center.id = :centerId
            """)
    List<VaccineRecord> findRecordsNeedingFollowUp(@Param("centerId") Long centerId);

    List<VaccineRecord> findByDoctor_IdOrderByVaccinationDateDesc(Long doctorId);

    List<VaccineRecord> findByCenter_CenterIdOrderByVaccinationDateDesc(Long centerId);

    Optional<VaccineRecord> findByIpfsHash(String ipfsHash);
}
