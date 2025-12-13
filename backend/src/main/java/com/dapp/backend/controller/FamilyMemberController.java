package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.dto.request.FamilyMemberDetailRequest;
import com.dapp.backend.dto.request.FamilyMemberRequest;
import com.dapp.backend.dto.response.FamilyMemberResponse;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.dto.response.VaccinationRouteResponse;
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
    private final com.dapp.backend.service.AppointmentService appointmentService;

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

    @PostMapping("/detail")
    @ApiMessage("Get family member detail")
    public ResponseEntity<FamilyMemberResponse> getFamilyMemberDetail(
            @RequestBody FamilyMemberDetailRequest request) throws AppException {
        return familyMemberService.getFamilyMemberById(request.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/my-members")
    @ApiMessage("Get my family members")
    public ResponseEntity<java.util.List<FamilyMemberResponse>> getMyFamilyMembers() throws AppException {
        return ResponseEntity.ok(familyMemberService.getMyFamilyMembers());
    }

    @PostMapping("/patient-members")
    @ApiMessage("Get patient family members for staff")
    public ResponseEntity<java.util.List<FamilyMemberResponse>> getPatientFamilyMembers(
            @RequestBody FamilyMemberDetailRequest request) {
        return ResponseEntity.ok(familyMemberService.getFamilyMembersByUserId(request.getId()));
    }

    @PostMapping("/booking-history-grouped")
    @ApiMessage("Get family member booking history grouped")
    public ResponseEntity<java.util.List<VaccinationRouteResponse>> getFamilyBookingHistoryGrouped(
            @RequestBody FamilyMemberDetailRequest request) throws AppException {
        return ResponseEntity.ok(appointmentService.getGroupedHistoryBookingForFamilyMember(request.getId()));
    }
}
