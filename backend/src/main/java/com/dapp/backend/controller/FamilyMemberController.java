package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.dto.request.FamilyMemberRequest;
import com.dapp.backend.dto.response.FamilyMemberResponse;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.FamilyMember;
import com.dapp.backend.service.FamilyMemberService;
import com.turkraft.springfilter.boot.Filter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/family-members")
@RequiredArgsConstructor
public class FamilyMemberController {

    private final FamilyMemberService familyMemberService;

    @PostMapping
    @ApiMessage("Add a new family member")
    public ResponseEntity<FamilyMemberResponse> addFamilyMember(@RequestBody FamilyMemberRequest request)
            throws AppException {
        return ResponseEntity.ok(familyMemberService.addFamilyMember(request));
    }

    @PutMapping
    @ApiMessage("Update a family member")
    public ResponseEntity<FamilyMemberResponse> updateFamilyMember(@RequestBody FamilyMemberRequest request)
            throws AppException {
        return ResponseEntity.ok(familyMemberService.updateFamilyMember(request));
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete a family member")
    public ResponseEntity<Void> deleteFamilyMember(@PathVariable Long id) throws AppException {
        familyMemberService.deleteFamilyMember(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @ApiMessage("Get all family members")
    public ResponseEntity<Pagination> getAllFamilyMembers(@Filter Specification<FamilyMember> specification,
            Pageable pageable) throws AppException {
        return ResponseEntity.ok(familyMemberService.getAllFamilyMembers(specification, pageable));
    }

    @GetMapping("/{id}")
    @ApiMessage("Get family member by id")
    public ResponseEntity<FamilyMemberResponse> getFamilyMemberById(@PathVariable Long id) throws AppException {
        return familyMemberService.getFamilyMemberById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    @ApiMessage("Get family members by user id")
    public ResponseEntity<java.util.List<FamilyMemberResponse>> getFamilyMembersByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(familyMemberService.getFamilyMembersByUserId(userId));
    }
}
