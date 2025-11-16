package com.dapp.backend.service;

import com.dapp.backend.dto.request.FamilyMemberRequest;
import com.dapp.backend.dto.response.FamilyMemberResponse;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.User;
import com.dapp.backend.model.FamilyMember;

import com.dapp.backend.repository.FamilyMemberRepository;

import com.dapp.backend.service.spec.FamilyMemberSpecifications;
import lombok.RequiredArgsConstructor;
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
public class FamilyMemberService {

    private final AuthService authService;
    private final FamilyMemberRepository familyMemberRepository;

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
        FamilyMember familyMember = toEntity(request);
        familyMember.setUser(user);
        FamilyMember savedMember = familyMemberRepository.save(familyMember);
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
    public Pagination getAllFamilyMembers(Specification<FamilyMember> specification, Pageable pageable) throws AppException {

        User user = authService.getCurrentUserLogin();
        specification = Specification.where(specification).and(FamilyMemberSpecifications.findByUser(user.getFullName()));

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
}