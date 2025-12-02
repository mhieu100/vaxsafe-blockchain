package com.dapp.backend.service;

import com.dapp.backend.dto.response.VaccineRecordResponse;
import com.dapp.backend.enums.IdentityType;
import com.dapp.backend.enums.VaccinationSite;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.*;
import com.dapp.backend.repository.FamilyMemberRepository;
import com.dapp.backend.repository.VaccineRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VaccineRecordService {

    private final VaccineRecordRepository vaccineRecordRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final BlockchainService blockchainService;

    /**
     * Create vaccine record from completed appointment
     */
    @Transactional
    public VaccineRecord createFromAppointment(
            Appointment appointment,
            String lotNumber,
            LocalDate expiryDate,
            VaccinationSite site,
            String notes) throws AppException {

        // Check if record already exists
        if (vaccineRecordRepository.findByAppointmentId(appointment.getId()).isPresent()) {
            throw new AppException("Vaccine record already exists for this appointment");
        }

        Booking booking = appointment.getBooking();
        User patient = booking.getPatient();
        FamilyMember familyMember = booking.getFamilyMember();

        // Determine patient info
        String patientName;
        String identityHash;

        if (patient != null) {
            // Adult patient
            patientName = patient.getFullName();
            identityHash = patient.getBlockchainIdentityHash();
        } else if (familyMember != null) {
            // Child patient
            patientName = familyMember.getFullName();
            identityHash = familyMember.getBlockchainIdentityHash();
        } else {
            throw new AppException("No patient information found in booking");
        }

        // Calculate next dose date if applicable
        LocalDate nextDoseDate = calculateNextDoseDate(
                appointment.getVaccinationDate(),
                booking.getVaccine(),
                appointment.getDoseNumber());

        VaccineRecord record = VaccineRecord.builder()
                .user(patient)
                .familyMember(familyMember)
                .patientName(patientName)
                .patientIdentityHash(identityHash)
                .vaccine(booking.getVaccine())
                .doseNumber(appointment.getDoseNumber())
                .lotNumber(lotNumber)
                .expiryDate(expiryDate)
                .manufacturer(booking.getVaccine().getManufacturer())
                .vaccinationDate(appointment.getVaccinationDate())
                .site(site)
                .doctor(appointment.getDoctor())
                .center(appointment.getCenter())
                .appointment(appointment)
                .notes(notes)
                .isVerified(false)
                .nextDoseDate(nextDoseDate)
                .nextDoseNumber(appointment.getDoseNumber() + 1)
                .build();

        VaccineRecord saved = vaccineRecordRepository.save(record);

        log.info("Created vaccine record {} for appointment {}", saved.getId(), appointment.getId());

        // Push to blockchain asynchronously
        try {
            if (blockchainService.isBlockchainServiceAvailable()) {
                var blockchainResponse = blockchainService.createVaccineRecord(saved);
                if (blockchainResponse != null && blockchainResponse.isSuccess()) {
                    saved.setBlockchainRecordId(blockchainResponse.getData().getRecordId());
                    saved.setTransactionHash(blockchainResponse.getData().getTransactionHash());
                    saved.setBlockNumber(blockchainResponse.getData().getBlockNumber());
                    vaccineRecordRepository.save(saved);
                    log.info("Vaccine record synced to blockchain: recordId={}, txHash={}",
                            blockchainResponse.getData().getRecordId(),
                            blockchainResponse.getData().getTransactionHash());
                }
            } else {
                log.warn("Blockchain service not available, record saved to database only");
            }
        } catch (Exception e) {
            log.error("Failed to sync vaccine record to blockchain", e);
            // Continue - record is still saved in database
        }

        return saved;
    }

    /**
     * Get vaccine history for user
     */
    public List<VaccineRecord> getUserVaccineHistory(Long userId) {
        return vaccineRecordRepository.findByUserIdOrderByVaccinationDateDesc(userId);
    }

    /**
     * Get vaccine history for family member
     */
    public List<VaccineRecord> getFamilyMemberVaccineHistory(Long familyMemberId) {
        return vaccineRecordRepository.findByFamilyMemberIdOrderByVaccinationDateDesc(familyMemberId);
    }

    /**
     * Get combined vaccine history (for displaying in UI)
     */
    public List<VaccineRecord> getCombinedVaccineHistory(Long userId, Long familyMemberId) {
        return vaccineRecordRepository.findVaccineHistory(userId, familyMemberId);
    }

    /**
     * Verify record on blockchain
     */
    @Transactional
    public VaccineRecord verifyOnBlockchain(Long recordId) throws AppException {
        VaccineRecord record = vaccineRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException("Vaccine record not found"));

        if (record.isVerified()) {
            throw new AppException("Record already verified");
        }

        // TODO: Verify on blockchain
        // boolean isValid =
        // blockchainService.verifyRecord(record.getBlockchainTxHash());
        // if (!isValid) {
        // throw new AppException("Blockchain verification failed");
        // }

        record.setVerified(true);
        record.setVerifiedAt(LocalDateTime.now());

        return vaccineRecordRepository.save(record);
    }

    /**
     * Add adverse reactions to record
     */
    @Transactional
    public VaccineRecord addAdverseReactions(Long recordId, String reactions) throws AppException {
        VaccineRecord record = vaccineRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException("Vaccine record not found"));

        record.setAdverseReactions(reactions);

        // If serious, set follow-up date
        if (reactions.toLowerCase().contains("severe") || reactions.toLowerCase().contains("nghiêm trọng")) {
            record.setFollowUpDate(LocalDateTime.now().plusDays(3));
        }

        return vaccineRecordRepository.save(record);
    }

    /**
     * Get records needing follow-up for a center
     */
    public List<VaccineRecord> getRecordsNeedingFollowUp(Long centerId) {
        return vaccineRecordRepository.findRecordsNeedingFollowUp(centerId);
    }

    /**
     * Calculate next dose date based on vaccine schedule
     */
    private LocalDate calculateNextDoseDate(LocalDate currentDate, Vaccine vaccine, int currentDose) {
        // Default intervals (can be customized per vaccine)
        if (currentDose == 1) {
            return currentDate.plusDays(vaccine.getDaysForNextDose() != null ? vaccine.getDaysForNextDose() : 30);
        } else if (currentDose == 2) {
            return currentDate.plusMonths(6);
        } else if (currentDose == 3) {
            return currentDate.plusYears(1);
        }

        return null; // No next dose
    }

    /**
     * Get vaccination statistics for a patient
     */
    public VaccinationStatistics getStatistics(Long userId, Long familyMemberId) {
        List<VaccineRecord> records = getCombinedVaccineHistory(userId, familyMemberId);

        long totalVaccinations = records.size();
        long verifiedCount = records.stream().filter(VaccineRecord::isVerified).count();
        LocalDate lastVaccinationDate = records.isEmpty() ? null : records.get(0).getVaccinationDate();
        LocalDate nextDueDate = records.stream()
                .filter(r -> r.getNextDoseDate() != null && r.getNextDoseDate().isAfter(LocalDate.now()))
                .map(VaccineRecord::getNextDoseDate)
                .min(LocalDate::compareTo)
                .orElse(null);

        return new VaccinationStatistics(
                totalVaccinations,
                verifiedCount,
                lastVaccinationDate,
                nextDueDate);
    }

    /**
     * Statistics DTO
     */
    public record VaccinationStatistics(
            long totalVaccinations,
            long verifiedCount,
            LocalDate lastVaccinationDate,
            LocalDate nextDueDate) {
    }

    /**
     * Get all vaccine records for a patient (includes both user records and family member records)
     * @param userId The ID of the user (patient or guardian)
     * @return List of vaccine records
     */
    public List<VaccineRecordResponse> getAllVaccineRecordsByPatient(Long userId) throws AppException {
        log.info("Fetching vaccine records for user ID: {}", userId);
        
        List<VaccineRecord> records = new ArrayList<>();
        
        // Get records for the user themselves (adult patient)
        List<VaccineRecord> userRecords = vaccineRecordRepository.findByUserIdOrderByVaccinationDateDesc(userId);
        records.addAll(userRecords);
        log.info("Found {} records for user ID: {}", userRecords.size(), userId);
        
        // Get records for family members (children) of this user
        List<FamilyMember> familyMembers = familyMemberRepository.findByUserId(userId);
        log.info("Found {} family members for user ID: {}", familyMembers.size(), userId);
        
        for (FamilyMember member : familyMembers) {
            List<VaccineRecord> memberRecords = vaccineRecordRepository
                    .findByFamilyMemberIdOrderByVaccinationDateDesc(member.getId());
            records.addAll(memberRecords);
            log.info("Found {} records for family member ID: {}", memberRecords.size(), member.getId());
        }
        
        log.info("Total vaccine records found: {}", records.size());
        
        return records.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Map VaccineRecord entity to VaccineRecordResponse DTO
     */
    private VaccineRecordResponse mapToResponse(VaccineRecord record) {
        return VaccineRecordResponse.builder()
                .id(record.getId())
                .patientName(record.getPatientName())
                .patientIdentityHash(record.getPatientIdentityHash())
                .vaccineId(record.getVaccine() != null ? record.getVaccine().getId() : null)
                .vaccineName(record.getVaccine() != null ? record.getVaccine().getName() : "Unknown")
                .doseNumber(record.getDoseNumber())
                .lotNumber(record.getLotNumber())
                .expiryDate(record.getExpiryDate())
                .manufacturer(record.getManufacturer())
                .vaccinationDate(record.getVaccinationDate())
                .site(record.getSite())
                .doctorId(record.getDoctor() != null ? record.getDoctor().getId() : null)
                .doctorName(record.getDoctor() != null ? record.getDoctor().getFullName() : "Unknown")
                .centerId(record.getCenter() != null ? record.getCenter().getCenterId() : null)
                .centerName(record.getCenter() != null ? record.getCenter().getName() : "Unknown")
                .appointmentId(record.getAppointment() != null ? record.getAppointment().getId() : null)
                .notes(record.getNotes())
                .adverseReactions(record.getAdverseReactions())
                .followUpDate(record.getFollowUpDate())
                .blockchainRecordId(record.getBlockchainRecordId())
                .transactionHash(record.getTransactionHash())
                .blockNumber(record.getBlockNumber())
                .ipfsHash(record.getIpfsHash())
                .digitalSignature(record.getDigitalSignature())
                .isVerified(record.isVerified())
                .verifiedAt(record.getVerifiedAt())
                .nextDoseDate(record.getNextDoseDate())
                .nextDoseNumber(record.getNextDoseNumber())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}
