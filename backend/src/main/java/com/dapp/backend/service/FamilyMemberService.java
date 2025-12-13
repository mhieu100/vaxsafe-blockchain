package com.dapp.backend.service;

import com.dapp.backend.dto.request.FamilyMemberRequest;
import com.dapp.backend.dto.response.FamilyMemberResponse;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.enums.IdentityType;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.FamilyMember;
import com.dapp.backend.model.User;
import com.dapp.backend.repository.FamilyMemberRepository;
import com.dapp.backend.service.spec.FamilyMemberSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class FamilyMemberService {

    private final AuthService authService;
    private final FamilyMemberRepository familyMemberRepository;
    private final IdentityService identityService;
    private final BlockchainService blockchainService;
    private final com.dapp.backend.repository.VaccineRecordRepository vaccineRecordRepository;

    public FamilyMember toEntity(FamilyMemberRequest request) {
        FamilyMember entity = new FamilyMember();
        entity.setFullName(request.getFullName());
        entity.setDateOfBirth(request.getDateOfBirth());
        entity.setRelationship(request.getRelationship());
        entity.setPhone(request.getPhone());
        entity.setGender(request.getGender());
        entity.setIdentityNumber(request.getIdentityNumber());
        entity.setHeightCm(request.getHeightCm());
        entity.setWeightKg(request.getWeightKg());
        return entity;
    }

    public FamilyMemberResponse toResponse(FamilyMember entity) {
        FamilyMemberResponse response = new FamilyMemberResponse();
        response.setId(entity.getId());
        response.setFullName(entity.getFullName());
        response.setDateOfBirth(entity.getDateOfBirth());
        response.setRelationship(entity.getRelationship());
        response.setPhone(entity.getPhone());
        response.setGender(entity.getGender());
        response.setIdentityNumber(entity.getIdentityNumber());
        response.setHeightCm(entity.getHeightCm());
        response.setWeightKg(entity.getWeightKg());
        response.setParentId(entity.getUser().getId());

        // Statistics
        try {
            long count = vaccineRecordRepository.countByFamilyMemberId(entity.getId());
            response.setTotalVaccinations((int) count);

            if (count > 0) {
                List<com.dapp.backend.model.VaccineRecord> records = vaccineRecordRepository
                        .findByFamilyMemberIdOrderByVaccinationDateDesc(entity.getId());
                if (!records.isEmpty()) {
                    com.dapp.backend.model.VaccineRecord latest = records.get(0);
                    response.setLastVaccinationDate(latest.getVaccinationDate());

                    // Determine Status
                    if (latest.getNextDoseDate() == null) {
                        response.setVaccinationStatus("UP_TO_DATE");
                    } else if (latest.getNextDoseDate().isBefore(java.time.LocalDate.now())) {
                        response.setVaccinationStatus("OVERDUE");
                    } else {
                        response.setVaccinationStatus("PARTIAL");
                    }
                }
            } else {
                response.setVaccinationStatus("NOT_STARTED");
            }
        } catch (Exception e) {
            log.warn("Error calculating vaccine stats for member {}: {}", entity.getId(), e.getMessage());
            response.setVaccinationStatus("UNKNOWN");
        }

        return response;
    }

    public void updateEntityFromRequest(FamilyMemberRequest request, FamilyMember entity) {
        entity.setFullName(request.getFullName());
        entity.setDateOfBirth(request.getDateOfBirth());
        entity.setRelationship(request.getRelationship());
        entity.setPhone(request.getPhone());
        entity.setGender(request.getGender());
        entity.setHeightCm(request.getHeightCm());
        entity.setWeightKg(request.getWeightKg());
    }

    public FamilyMemberResponse addFamilyMember(FamilyMemberRequest request) throws AppException {
        User user = authService.getCurrentUserLogin();

        if (request.getIdentityNumber() != null && !request.getIdentityNumber().trim().isEmpty()) {
            if (!request.getIdentityNumber().matches("^\\d{9,12}$")) {
                throw new AppException("Identity number must be 9-12 digits");
            }
            if (familyMemberRepository.existsByIdentityNumber(request.getIdentityNumber())) {
                throw new AppException("Identity number already exists");
            }
        } else {
            request.setIdentityNumber(null);
        }

        FamilyMember familyMember = toEntity(request);
        familyMember.setUser(user);

        // --- NEW LOGIC: Generate Identity BEFORE Save ---

        try {
            // 1. Generate Identity Hash & DID
            IdentityType idType = identityService.determineIdentityType(familyMember.getDateOfBirth());
            String identityHash = identityService.generateFamilyMemberIdentityHash(familyMember);
            String did = identityService.generateDID(identityHash, idType);

            // 2. Set Identity Info on Entity
            familyMember.setBlockchainIdentityHash(identityHash);
            familyMember.setDid(did);

            // 3. Generate & Upload FHIR Data to IPFS (uses identityHash for filename)
            String ipfsDataHash = identityService.generateFamilyMemberDataJson(familyMember);
            familyMember.setIpfsDataHash(ipfsDataHash);

            log.debug("Presaved identity for family member: {} (hash: {}, DID: {})",
                    familyMember.getFullName(), identityHash, did);

            // 4. Save to Database (Single Save)
            FamilyMember savedMember = familyMemberRepository.save(familyMember);

            // 5. Blockchain Sync (Async/Fire-and-forget logic if needed, but here sync)
            if (blockchainService.isBlockchainServiceAvailable()) {
                var response = blockchainService.createIdentity(
                        savedMember.getBlockchainIdentityHash(),
                        savedMember.getDid(),
                        idType,
                        savedMember.getIpfsDataHash(),
                        "family-member-" + savedMember.getFullName());

                if (response != null && response.isSuccess()) {
                    log.info("Blockchain identity created for family member: {} (txHash: {})",
                            savedMember.getFullName(), response.getData().getTransactionHash());
                } else {
                    log.warn("Failed to create blockchain identity for family member: {}", savedMember.getFullName());
                }
            } else {
                log.warn("Blockchain service not available, identity saved to database only");
            }

            return toResponse(savedMember);

        } catch (Exception e) {
            log.error("Error creating family member with identity: {}", familyMember.getFullName(), e);
            throw new AppException("Failed to create family member: " + e.getMessage());
        }
    }

    public FamilyMemberResponse updateFamilyMember(FamilyMemberRequest request) throws AppException {
        User user = authService.getCurrentUserLogin();
        FamilyMember existing = familyMemberRepository.findById(request.getId())
                .orElseThrow(() -> new AppException("Family member not found with ID: " + request.getId()));
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new AppException("Unauthorized update attempt for family member ID: " + request.getId());
        }
        updateEntityFromRequest(request, existing);
        FamilyMember updatedMember = familyMemberRepository.save(existing);
        return toResponse(updatedMember);
    }

    public void deleteFamilyMember(Long id) throws AppException {
        User user = authService.getCurrentUserLogin();
        FamilyMember existing = familyMemberRepository.findById(id)
                .orElseThrow(() -> new AppException("Family member not found with ID: " + id));
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new AppException("Unauthorized delete attempt for family member ID: " + id);
        }
        familyMemberRepository.delete(existing);
    }

    @Transactional(readOnly = true)
    public Pagination getAllFamilyMembers(Specification<FamilyMember> specification, Pageable pageable)
            throws AppException {

        User user = authService.getCurrentUserLogin();
        specification = Specification.where(specification)
                .and(FamilyMemberSpecifications.findByUserId(user.getId()));

        Page<FamilyMember> pageMember = familyMemberRepository.findAll(specification, pageable);
        Pagination pagination = new Pagination();
        Pagination.Meta meta = new Pagination.Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(pageMember.getTotalPages());
        meta.setTotal(pageMember.getTotalElements());
        pagination.setMeta(meta);

        List<FamilyMemberResponse> listMembers = pageMember.getContent().stream()
                .map(this::toResponse).collect(Collectors.toList());
        pagination.setResult(listMembers);

        return pagination;
    }

    @Transactional(readOnly = true)
    public Optional<FamilyMemberResponse> getFamilyMemberById(Long id) throws AppException {
        User user = authService.getCurrentUserLogin();
        return familyMemberRepository.findById(id)
                .filter(fm -> fm.getUser().getId().equals(user.getId()))
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<FamilyMemberResponse> getFamilyMembersByUserId(Long userId) {
        return familyMemberRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<FamilyMemberResponse> getMyFamilyMembers() throws AppException {
        User user = authService.getCurrentUserLogin();
        return getFamilyMembersByUserId(user.getId());
    }
}