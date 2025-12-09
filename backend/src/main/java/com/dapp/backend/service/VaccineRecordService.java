package com.dapp.backend.service;

import com.dapp.backend.dto.mapper.fhir.FhirImmunizationMapper;
import com.dapp.backend.dto.response.VaccineRecordResponse;
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
    private final FhirImmunizationMapper fhirImmunizationMapper;

    private static final ca.uhn.fhir.context.FhirContext fhirContext = ca.uhn.fhir.context.FhirContext.forR4();

    @Transactional
    public VaccineRecord createFromAppointment(
            Appointment appointment,
            com.dapp.backend.dto.request.CompleteAppointmentRequest request) throws AppException {

        if (vaccineRecordRepository.findByAppointmentId(appointment.getId()).isPresent()) {
            throw new AppException("Vaccine record already exists for this appointment");
        }

        // Booking booking = appointment.getBooking();
        User patient = appointment.getPatient();
        FamilyMember familyMember = appointment.getFamilyMember();

        String patientName;
        String identityHash;

        if (patient != null) {

            patientName = patient.getFullName();
            identityHash = patient.getBlockchainIdentityHash();
        } else if (familyMember != null) {

            patientName = familyMember.getFullName();
            identityHash = familyMember.getBlockchainIdentityHash();
        } else {
            throw new AppException("No patient information found in booking");
        }

        LocalDate nextDoseDate = calculateNextDoseDate(
                appointment.getVaccinationDate(),
                appointment.getVaccine(),
                appointment.getDoseNumber());

        VaccineRecord record = VaccineRecord.builder()
                .user(patient)
                .familyMember(familyMember)
                .patientName(patientName)
                .patientIdentityHash(identityHash)
                .patientIdentityHash(identityHash)
                .vaccine(appointment.getVaccine())
                .doseNumber(appointment.getDoseNumber())
                .expiryDate(request.getExpiryDate())
                .manufacturer(appointment.getVaccine().getManufacturer())
                .vaccinationDate(appointment.getVaccinationDate())
                .site(request.getSite())
                .doctor(appointment.getDoctor())
                .center(appointment.getCenter())
                .appointment(appointment)
                .notes(request.getNotes())
                .height(request.getHeight())
                .weight(request.getWeight())
                .temperature(request.getTemperature())
                .pulse(request.getPulse())
                .adverseReactions(request.getAdverseReactions())
                .isVerified(false)
                .nextDoseDate(nextDoseDate)
                .nextDoseNumber(nextDoseDate != null ? appointment.getDoseNumber() + 1 : null)
                .build();

        VaccineRecord saved = vaccineRecordRepository.save(record);

        log.info("Created vaccine record {} for appointment {}", saved.getId(), appointment.getId());

        String ipfsHash = null;

        try {
            if (blockchainService.isBlockchainServiceAvailable()) {

                org.hl7.fhir.r4.model.Immunization fhirImmunization = fhirImmunizationMapper.toFhirImmunization(saved);

                String fhirJson = fhirContext.newJsonParser().setPrettyPrint(true)
                        .encodeResourceToString(fhirImmunization);

                ipfsHash = blockchainService.uploadToIpfs(fhirJson);

                if (ipfsHash != null) {
                    saved.setIpfsHash(ipfsHash);
                    saved = vaccineRecordRepository.save(saved);
                    log.info("✅ FHIR Immunization JSON uploaded to IPFS. Hash: {}", ipfsHash);
                } else {
                    log.warn("⚠️ Failed to upload FHIR JSON to IPFS (Hash is null)");
                }
            } else {
                log.warn("⚠️ Blockchain service unavailable, skipping IPFS and Blockchain sync");
            }
        } catch (Exception e) {
            log.error("⚠️ Failed to generate FHIR JSON or upload to IPFS", e);

        }

        try {
            if (blockchainService.isBlockchainServiceAvailable()) {

                var blockchainResponse = blockchainService.createVaccineRecord(saved);

                if (blockchainResponse != null && blockchainResponse.isSuccess()) {
                    saved.setBlockchainRecordId(blockchainResponse.getData().getRecordId());
                    saved.setTransactionHash(blockchainResponse.getData().getTransactionHash());
                    saved.setBlockNumber(blockchainResponse.getData().getBlockNumber());
                    vaccineRecordRepository.save(saved);

                    log.info("✅ Vaccine record synced to blockchain: recordId={}, txHash={}",
                            blockchainResponse.getData().getRecordId(),
                            blockchainResponse.getData().getTransactionHash());
                } else {
                    log.warn("⚠️ Blockchain record creation failed");
                }
            }
        } catch (Exception e) {
            log.error("❌ Failed to sync vaccine record to blockchain", e);
        }

        return saved;
    }

    public List<VaccineRecord> getUserVaccineHistory(Long userId) {
        return vaccineRecordRepository.findByUserIdOrderByVaccinationDateDesc(userId);
    }

    public List<VaccineRecord> getFamilyMemberVaccineHistory(Long familyMemberId) {
        return vaccineRecordRepository.findByFamilyMemberIdOrderByVaccinationDateDesc(familyMemberId);
    }

    public List<VaccineRecord> getCombinedVaccineHistory(Long userId, Long familyMemberId) {
        return vaccineRecordRepository.findVaccineHistory(userId, familyMemberId);
    }

    @Transactional
    public VaccineRecord verifyOnBlockchain(Long recordId) throws AppException {
        VaccineRecord record = vaccineRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException("Vaccine record not found"));

        if (record.isVerified()) {
            throw new AppException("Record already verified");
        }

        record.setVerified(true);
        record.setVerifiedAt(LocalDateTime.now());

        return vaccineRecordRepository.save(record);
    }

    @Transactional
    public VaccineRecord addAdverseReactions(Long recordId, String reactions) throws AppException {
        VaccineRecord record = vaccineRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException("Vaccine record not found"));

        record.setAdverseReactions(reactions);

        if (reactions.toLowerCase().contains("severe") || reactions.toLowerCase().contains("nghiêm trọng")) {
            record.setFollowUpDate(LocalDateTime.now().plusDays(3));
        }

        return vaccineRecordRepository.save(record);
    }

    public List<VaccineRecord> getRecordsNeedingFollowUp(Long centerId) {
        return vaccineRecordRepository.findRecordsNeedingFollowUp(centerId);
    }

    private LocalDate calculateNextDoseDate(LocalDate currentDate, Vaccine vaccine, int currentDose) {

        if (currentDose >= vaccine.getDosesRequired()) {
            return null;
        }

        if (currentDose == 1) {
            return currentDate.plusDays(vaccine.getDaysForNextDose() != null ? vaccine.getDaysForNextDose() : 30);
        } else if (currentDose == 2) {
            return currentDate.plusMonths(6);
        } else if (currentDose == 3) {
            return currentDate.plusYears(1);
        }

        return null;
    }

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

    public record VaccinationStatistics(
            long totalVaccinations,
            long verifiedCount,
            LocalDate lastVaccinationDate,
            LocalDate nextDueDate) {
    }

    public List<VaccineRecordResponse> getAllVaccineRecordsByPatient(Long userId) throws AppException {
        log.info("Fetching vaccine records for user ID: {}", userId);

        List<VaccineRecord> records = new ArrayList<>();

        List<VaccineRecord> userRecords = vaccineRecordRepository.findByUserIdOrderByVaccinationDateDesc(userId);
        records.addAll(userRecords);
        log.info("Found {} records for user ID: {}", userRecords.size(), userId);

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

    public List<VaccineRecordResponse> getFamilyMemberVaccineRecords(Long familyMemberId, Long ownerUserId)
            throws AppException {
        // Verify family member belongs to user
        familyMemberRepository.findById(familyMemberId)
                .filter(fm -> fm.getUser().getId().equals(ownerUserId))
                .orElseThrow(() -> new AppException("Family member not found or does not belong to user"));

        List<VaccineRecord> records = vaccineRecordRepository
                .findByFamilyMemberIdOrderByVaccinationDateDesc(familyMemberId);
        return records.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private VaccineRecordResponse mapToResponse(VaccineRecord record) {
        return VaccineRecordResponse.builder()
                .id(record.getId())
                .patientName(record.getPatientName())
                .patientIdentityHash(record.getPatientIdentityHash())
                .vaccineId(record.getVaccine() != null ? record.getVaccine().getId() : null)
                .vaccineName(record.getVaccine() != null ? record.getVaccine().getName() : "Unknown")
                .vaccineSlug(record.getVaccine() != null ? record.getVaccine().getSlug() : null)
                .dosesRequired(record.getVaccine() != null ? record.getVaccine().getDosesRequired() : null)
                .doseNumber(record.getDoseNumber())
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
                .height(record.getHeight())
                .weight(record.getWeight())
                .temperature(record.getTemperature())
                .pulse(record.getPulse())
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
