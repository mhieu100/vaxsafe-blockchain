package com.dapp.backend.repository;

import com.dapp.backend.model.FamilyMember;
import com.dapp.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long>, JpaSpecificationExecutor<FamilyMember> {
    List<FamilyMember> findByUser(User user);
    
    List<FamilyMember> findByUserId(Long userId);
    
    boolean existsByIdentityNumber(String identityNumber);
}