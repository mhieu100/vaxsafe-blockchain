package com.dapp.backend.service;

import com.dapp.backend.enums.IdentityType;
import com.dapp.backend.model.FamilyMember;
import com.dapp.backend.model.User;
import com.dapp.backend.repository.FamilyMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${identity.hashing.salt}")
    private String identitySalt;

    private final BlockchainService blockchainService;
    private final FamilyMemberRepository familyMemberRepository;

    public String generateUserIdentityHash(User user) {
        try {

            String identityNum = "";
            if (user.getPatientProfile() != null && user.getPatientProfile().getIdentityNumber() != null) {
                identityNum = user.getPatientProfile().getIdentityNumber().trim();
            }

            // Append SALT to the data string
            String data = String.format("%s:%s:%s:VAXSAFE_IDENTITY:%s",
                    identityNum,
                    user.getFullName().trim(),
                    user.getBirthday() != null ? user.getBirthday().toString() : "0000-01-01",
                    identitySalt);

            String hash = generateSha256Hash(data);
            log.debug("Generated identity hash for user: {} (birthday: {})",
                    user.getEmail(), user.getBirthday() != null ? "set" : "pending");

            return hash;
        } catch (Exception e) {
            log.error("Error generating user identity hash", e);
            throw new RuntimeException("Failed to generate identity hash", e);
        }
    }

    public String generateFamilyMemberIdentityHash(FamilyMember familyMember) {
        try {

            // Construct parent identity string: ID + Name + DOB
            String parentIdNum = "";
            String parentDob = "0000-01-01";
            String parentName = "UNKNOWN";

            if (familyMember.getUser() != null) {
                User parent = familyMember.getUser();
                parentName = parent.getFullName().trim();
                if (parent.getBirthday() != null) {
                    parentDob = parent.getBirthday().toString();
                }
                if (parent.getPatientProfile() != null && parent.getPatientProfile().getIdentityNumber() != null) {
                    parentIdNum = parent.getPatientProfile().getIdentityNumber().trim();
                }
            }

            // familyIdentity = patientIdentity + childName + childDob + SALT
            // patientIdentity = parentIdNum + parentName + parentDob

            String data = String.format("%s:%s:%s:%s:%s:VAXSAFE_CHILD_IDENTITY:%s",
                    parentIdNum,
                    parentName,
                    parentDob,
                    familyMember.getFullName().trim(),
                    familyMember.getDateOfBirth().toString(),
                    identitySalt);

            String hash = generateSha256Hash(data);
            log.debug("Generated identity hash for family member: {} (guardian: {})",
                    familyMember.getFullName(), parentName);

            return hash;
        } catch (Exception e) {
            log.error("Error generating family member identity hash", e);
            throw new RuntimeException("Failed to generate identity hash", e);
        }
    }

    public String generateDID(String identityHash, IdentityType type) {
        String typePrefix = switch (type) {
            case ADULT -> "user";
            case CHILD -> "child";
            case NEWBORN -> "newborn";
        };

        String hashPart = identityHash.startsWith("0x")
                ? identityHash.substring(2, 18)
                : identityHash.substring(0, 16);

        return String.format("did:vax:vietnam:%s:%s", typePrefix, hashPart);
    }

    public IdentityType determineIdentityType(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            return IdentityType.ADULT;
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

    public IdentityType getCurrentIdentityType(LocalDate dateOfBirth) {
        return determineIdentityType(dateOfBirth);
    }

    public boolean isValidIdentityHash(String hash) {
        if (hash == null || hash.isEmpty()) {
            return false;
        }

        return hash.matches("^0x[0-9a-f]{64}$");
    }

    public boolean isValidDID(String did) {
        if (did == null || did.isEmpty()) {
            return false;
        }

        return did.matches("^did:vax:vietnam:(user|child|newborn):[0-9a-f]{16}$");
    }

    private String generateSha256Hash(String input) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));

        return "0x" + HexFormat.of().formatHex(hash);
    }

    public String generateIdentityDataJson(User user) {

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
                LocalDateTime.now().toString());
    }

    public String generateFamilyMemberDataJson(FamilyMember member) {

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
                LocalDateTime.now().toString());
    }

    public void linkBirthCertificate(FamilyMember member, String birthCertificateNumber) {
        log.info("\n" +
                "╔═══════════════════════════════════════════════════════════════════╗\n" +
                "║           📜 LINKING BIRTH CERTIFICATE                            ║\n" +
                "╠═══════════════════════════════════════════════════════════════════╣\n" +
                "║  👶 Member: {}\n" +
                "║  🆔 Identity Hash: {}\n" +
                "║  📄 Certificate #: {}\n" +
                "╚═══════════════════════════════════════════════════════════════════╝",
                member.getFullName(), member.getBlockchainIdentityHash(), birthCertificateNumber);

        member.setBirthCertificateNumber(birthCertificateNumber);
        familyMemberRepository.save(member);

        try {
            String ipfsHash = "";
            blockchainService.linkDocument(
                    member.getBlockchainIdentityHash(),
                    "BIRTH_CERTIFICATE",
                    ipfsHash);
            log.info("\n" +
                    "╔═══════════════════════════════════════════════════════════════════╗\n" +
                    "║           ✅ BIRTH CERTIFICATE LINKED                             ║\n" +
                    "╠═══════════════════════════════════════════════════════════════════╣\n" +
                    "║  🆔 Identity: {}\n" +
                    "║  📄 Certificate: {}\n" +
                    "║  ⛓️  Status: ON BLOCKCHAIN\n" +
                    "╚═══════════════════════════════════════════════════════════════════╝",
                    member.getBlockchainIdentityHash(), birthCertificateNumber);
        } catch (Exception e) {
            log.error("Failed to link birth certificate on blockchain", e);

        }
    }

    public void linkNationalID(FamilyMember member, String identityNumber) {
        log.info("\n" +
                "╔═══════════════════════════════════════════════════════════════════╗\n" +
                "║           🪪  LINKING NATIONAL ID                                 ║\n" +
                "╠═══════════════════════════════════════════════════════════════════╣\n" +
                "║  👤 Member: {}\n" +
                "║  🆔 Identity Hash: {}\n" +
                "║  🪪  National ID: {}\n" +
                "╚═══════════════════════════════════════════════════════════════════╝",
                member.getFullName(), member.getBlockchainIdentityHash(), identityNumber);

        member.setIdentityNumber(identityNumber);
        familyMemberRepository.save(member);

        try {
            String ipfsHash = "";
            blockchainService.linkDocument(
                    member.getBlockchainIdentityHash(),
                    "NATIONAL_ID",
                    ipfsHash);
            log.info("\n" +
                    "╔═══════════════════════════════════════════════════════════════════╗\n" +
                    "║           ✅ NATIONAL ID LINKED                                   ║\n" +
                    "╠═══════════════════════════════════════════════════════════════════╣\n" +
                    "║  🆔 Identity: {}\n" +
                    "║  🪪  National ID: {}\n" +
                    "║  ⛓️  Status: ON BLOCKCHAIN\n" +
                    "╚═══════════════════════════════════════════════════════════════════╝",
                    member.getBlockchainIdentityHash(), identityNumber);
        } catch (Exception e) {
            log.error("Failed to link national ID on blockchain", e);

        }
    }
}
