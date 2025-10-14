package com.dapp.backend.service.spec;

import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.FamilyMember;
import org.springframework.data.jpa.domain.Specification;

public class FamilyMemberSpecifications {
    public static Specification<FamilyMember> findByUser(String fullName) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.like(root.get("user").get("fullName"), fullName);
    }
}
