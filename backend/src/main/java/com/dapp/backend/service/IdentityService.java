package com.dapp.backend.service;

import com.dapp.backend.enums.IdentityType;
import com.dapp.backend.model.FamilyMember;
import com.dapp.backend.model.User;
import com.dapp.backend.repository.FamilyMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
@Slf4j
public class IdentityService {

    private final BlockchainService blockchainService;
    private final FamilyMemberRepository familyMemberRepository;

    /**
     * Generate blockchain identity hash for User (Adult)
     * DETERMINISTIC: Hash chỉ phụ thuộc vào thông tin user, không dùng timestamp
     * Đảm bảo cùng 1 user luôn có cùng 1 identity hash
     * Hash = SHA256(email + fullName + birthday + identityNumber + "VAXSAFE_IDENTITY")
     */
    public String generateUserIdentityHash(User user) {
        try {
            // Dùng email làm unique identifier chính
            // Birthday có thể null khi register, sẽ được fill sau
            // Identity number thêm uniqueness (CCCD cho adult)
            String identityNum = "";
            if (user.getPatientProfile() != null && user.getPatientProfile().getIdentityNumber() != null) {
                identityNum = user.getPatientProfile().getIdentityNumber().trim();
            }
            
            String data = String.format("%s:%s:%s:%s:VAXSAFE_IDENTITY",
                    user.getEmail().toLowerCase().trim(), // Normalize email
                    user.getFullName().trim(),
                    user.getBirthday() != null ? user.getBirthday().toString() : "PENDING",
                    identityNum
            );
            
            String hash = generateSha256Hash(data);
            log.debug("Generated identity hash for user: {} (birthday: {})", 
                user.getEmail(), user.getBirthday() != null ? "set" : "pending");
            
            return hash;
        } catch (Exception e) {
            log.error("Error generating user identity hash", e);
            throw new RuntimeException("Failed to generate identity hash", e);
        }
    }

    /**
     * Generate blockchain identity hash for FamilyMember (Child)
     * DETERMINISTIC: Hash chỉ phụ thuộc vào thông tin child, không dùng timestamp
     * Đảm bảo cùng 1 child luôn có cùng 1 identity hash
     * Hash = SHA256(guardianEmail + childName + dateOfBirth + relationship + identityNumber)
     * 
     * @param familyMember The family member (child)
     */
    public String generateFamilyMemberIdentityHash(FamilyMember familyMember) {
        try {
            // Dùng tổ hợp: guardian email + child name + DOB + relationship + identity number
            // Đảm bảo unique cho mỗi child (identity number là unique)
            String guardianEmail = familyMember.getUser() != null 
                ? familyMember.getUser().getEmail().toLowerCase().trim()
                : "UNKNOWN_GUARDIAN";
            
            // Identity number is unique per person in Vietnam
            String identityNum = familyMember.getIdentityNumber() != null 
                ? familyMember.getIdentityNumber().trim()
                : "";
            
            String data = String.format("%s:%s:%s:%s:%s:VAXSAFE_CHILD_IDENTITY",
                    guardianEmail,
                    familyMember.getFullName().trim(),
                    familyMember.getDateOfBirth().toString(),
                    familyMember.getRelationship() != null ? familyMember.getRelationship() : "CHILD",
                    identityNum
            );
            
            String hash = generateSha256Hash(data);
            log.debug("Generated identity hash for family member: {} (guardian: {})", 
                familyMember.getFullName(), guardianEmail);
            
            return hash;
        } catch (Exception e) {
            log.error("Error generating family member identity hash", e);
            throw new RuntimeException("Failed to generate identity hash", e);
        }
    }

    /**
     * Generate DID (Decentralized Identifier)
     * Format: did:vax:vietnam:{identityHash}
     */
    public String generateDID(String identityHash, IdentityType type) {
        String typePrefix = switch (type) {
            case ADULT -> "user";
            case CHILD -> "child";
            case NEWBORN -> "newborn";
        };
        
        // Remove 0x prefix for DID format, take first 16 chars
        String hashPart = identityHash.startsWith("0x") 
            ? identityHash.substring(2, 18) 
            : identityHash.substring(0, 16);
        
        return String.format("did:vax:vietnam:%s:%s", typePrefix, hashPart);
    }

    /**
     * Determine identity type based on age at the time of creation
     * 
     * IMPORTANT: Identity type is STATIC on blockchain after creation
     * - A child created at age 5 will remain CHILD type even at age 20
     * - This is by design for immutability and simplicity
     * 
     * Options for handling age transitions:
     * 1. Keep static (current approach) - simpler, identity type reflects creation time
     * 2. Create new identity when turning 18 - preserves history
     * 3. Add updateIdentityType function - complex, breaks immutability
     * 
     * For queries: Always recalculate current type from DOB, don't rely on stored type
     */
    public IdentityType determineIdentityType(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            return IdentityType.ADULT; // Default for users without DOB
        }
        
        LocalDate now = LocalDate.now();
        int age = now.getYear() - dateOfBirth.getYear();
        
        if (now.getDayOfYear() < dateOfBirth.getDayOfYear()) {
            age--;
        }
        
        if (age < 1) {
            return IdentityType.NEWBORN;
        } else if (age < 18) {
            return IdentityType.CHILD;
        } else {
            return IdentityType.ADULT;
        }
    }
    
    /**
     * Get current identity type based on current age
     * Use this for display/UI purposes, not for blockchain operations
     */
    public IdentityType getCurrentIdentityType(LocalDate dateOfBirth) {
        return determineIdentityType(dateOfBirth);
    }

    /**
     * Validate identity hash format
     */
    public boolean isValidIdentityHash(String hash) {
        if (hash == null || hash.isEmpty()) {
            return false;
        }
        
        // Should be 0x + 64 characters hex string (bytes32 format)
        return hash.matches("^0x[0-9a-f]{64}$");
    }

    /**
     * Validate DID format
     */
    public boolean isValidDID(String did) {
        if (did == null || did.isEmpty()) {
            return false;
        }
        
        // Format: did:vax:vietnam:{type}:{hash}
        return did.matches("^did:vax:vietnam:(user|child|newborn):[0-9a-f]{16}$");
    }

    /**
     * Generate SHA-256 hash (simulating keccak256 for now)
     * In production, use Web3j library for actual keccak256
     * Returns hash with 0x prefix for blockchain compatibility (bytes32 format)
     */
    private String generateSha256Hash(String input) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
        // Add 0x prefix for bytes32 format required by blockchain
        return "0x" + HexFormat.of().formatHex(hash);
    }

    /**
     * Generate IPFS-compatible JSON for identity data
     * TODO: In production, upload this JSON to IPFS and return the hash (QmXxx...)
     * Currently returns JSON string for database storage only
     * 
     * Future implementation:
     * 1. Create JSON with sensitive data encrypted
     * 2. Upload to IPFS via ipfs.infura.io or local node
     * 3. Return IPFS hash: "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX"
     * 4. Store hash in database and on blockchain
     */
    public String generateIdentityDataJson(User user) {
        // TODO: Replace with real IPFS upload
        // String ipfsHash = ipfsService.uploadJson(jsonData);
        return String.format("""
            {
                "type": "USER_IDENTITY",
                "fullName": "%s",
                "email": "%s",
                "did": "%s",
                "createdAt": "%s"
            }
            """,
                user.getFullName(),
                user.getEmail(),
                user.getDid(),
                LocalDateTime.now().toString()
        );
    }

    /**
     * Generate IPFS-compatible JSON for family member identity
     * TODO: Upload to real IPFS in production
     * Note: Do NOT include identityNumber or sensitive PII in IPFS data
     */
    public String generateFamilyMemberDataJson(FamilyMember member) {
        // TODO: Real IPFS upload with encryption for sensitive fields
        return String.format("""
            {
                "type": "CHILD_IDENTITY",
                "fullName": "%s",
                "dateOfBirth": "%s",
                "did": "%s",
                "guardian": "%s",
                "createdAt": "%s"
            }
            """,
                member.getFullName(),
                member.getDateOfBirth().toString(),
                member.getDid(),
                member.getUser().getFullName(),
                LocalDateTime.now().toString()
        );
    }

    /**
     * Link birth certificate to existing identity
     * This updates the blockchain record when official documents are obtained
     */
    public void linkBirthCertificate(FamilyMember member, String birthCertificateNumber) {
        log.info("Linking birth certificate {} to identity {}", 
                birthCertificateNumber, member.getBlockchainIdentityHash());
        
        member.setBirthCertificateNumber(birthCertificateNumber);
        familyMemberRepository.save(member);
        
        // Link document to blockchain (backend wallet will sign automatically)
        try {
            String ipfsHash = ""; // TODO: Upload document to IPFS if needed
            blockchainService.linkDocument(
                member.getBlockchainIdentityHash(),
                "BIRTH_CERTIFICATE",
                ipfsHash
            );
            log.info("Birth certificate linked on blockchain for identity {}", member.getBlockchainIdentityHash());
        } catch (Exception e) {
            log.error("Failed to link birth certificate on blockchain", e);
            // Continue - document is still saved in database
        }
    }

    /**
     * Link national ID to existing identity (when child turns 14)
     */
    public void linkNationalID(FamilyMember member, String identityNumber) {
        log.info("Linking national ID {} to identity {}", 
                identityNumber, member.getBlockchainIdentityHash());
        
        member.setIdentityNumber(identityNumber);
        familyMemberRepository.save(member);
        
        // Link document to blockchain (backend wallet will sign automatically)
        try {
            String ipfsHash = ""; // TODO: Upload document to IPFS if needed
            blockchainService.linkDocument(
                member.getBlockchainIdentityHash(),
                "NATIONAL_ID",
                ipfsHash
            );
            log.info("National ID linked on blockchain for identity {}", member.getBlockchainIdentityHash());
        } catch (Exception e) {
            log.error("Failed to link national ID on blockchain", e);
            // Continue - document is still saved in database
        }
    }
}
