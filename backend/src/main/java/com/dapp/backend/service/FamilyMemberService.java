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

    public FamilyMember toEntity(FamilyMemberRequest request) {
        FamilyMember entity = new FamilyMember();
        entity.setFullName(request.getFullName());
        entity.setDateOfBirth(request.getDateOfBirth());
        entity.setRelationship(request.getRelationship());
        entity.setPhone(request.getPhone());
        entity.setGender(request.getGender());
        entity.setIdentityNumber(request.getIdentityNumber());
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
        response.setParentId(entity.getUser().getId());
        return response;
    }

    public void updateEntityFromRequest(FamilyMemberRequest request, FamilyMember entity) {
        entity.setFullName(request.getFullName());
        entity.setDateOfBirth(request.getDateOfBirth());
        entity.setRelationship(request.getRelationship());
        entity.setPhone(request.getPhone());
        entity.setGender(request.getGender());
    }

    public FamilyMemberResponse addFamilyMember(FamilyMemberRequest request) throws AppException {
        User user = authService.getCurrentUserLogin();

        // Validate identity number (9-12 digits for Vietnam ID/Birth Certificate)
        if (request.getIdentityNumber() == null || request.getIdentityNumber().trim().isEmpty()) {
            throw new AppException("Identity number is required for family member");
        }
        if (!request.getIdentityNumber().matches("^\\d{9,12}$")) {
            throw new AppException("Identity number must be 9-12 digits");
        }

        // Check for duplicate identity number
        if (familyMemberRepository.existsByIdentityNumber(request.getIdentityNumber())) {
            throw new AppException("Identity number already exists");
        }

        FamilyMember familyMember = toEntity(request);
        familyMember.setUser(user);

        // Generate blockchain identity BEFORE saving (to satisfy NOT NULL constraint)
        try {
            // Determine identity type based on date of birth
            IdentityType idType = identityService.determineIdentityType(familyMember.getDateOfBirth());
            String identityHash = identityService.generateFamilyMemberIdentityHash(familyMember);
            String did = identityService.generateDID(identityHash, idType);
            String ipfsDataHash = identityService.generateFamilyMemberDataJson(familyMember);

            familyMember.setBlockchainIdentityHash(identityHash);
            familyMember.setDid(did);
            familyMember.setIpfsDataHash(ipfsDataHash);

            log.debug("Generated identity for family member: {} (hash: {}, DID: {})",
                    familyMember.getFullName(), identityHash, did);
        } catch (Exception e) {
            log.error("Error generating blockchain identity for family member: {}", familyMember.getFullName(), e);
            throw new AppException("Failed to generate blockchain identity for family member: " + e.getMessage());
        }

        // Save to database with blockchain identity
        FamilyMember savedMember = familyMemberRepository.save(familyMember);

        // Sync to blockchain (async, non-blocking)
        try {
            if (blockchainService.isBlockchainServiceAvailable()) {
                IdentityType idType = identityService.determineIdentityType(savedMember.getDateOfBirth());
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
        } catch (Exception e) {
            log.error("Error syncing blockchain identity for family member: {}", savedMember.getFullName(), e);
            // Continue - family member is already saved in database
        }

        return toResponse(savedMember);
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
                .and(FamilyMemberSpecifications.findByUser(user.getFullName()));

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
}