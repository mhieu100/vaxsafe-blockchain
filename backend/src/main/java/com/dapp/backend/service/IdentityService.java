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
    private final com.dapp.backend.dto.mapper.fhir.FhirPatientMapper fhirPatientMapper;
    private static final ca.uhn.fhir.context.FhirContext fhirContext = ca.uhn.fhir.context.FhirContext.forR4();

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
        try {
            // 1. Convert User to FHIR Patient resource
            org.hl7.fhir.r4.model.Patient fhirPatient = fhirPatientMapper.toFhirPatient(user, user.getPatientProfile());

            // 2. Serialize FHIR resource to JSON string
            String fhirJson = fhirContext.newJsonParser().setPrettyPrint(true).encodeResourceToString(fhirPatient);

            // 3. Upload to IPFS
            if (blockchainService.isBlockchainServiceAvailable()) {
                String ipfsHash = blockchainService.uploadToIpfs(fhirJson);
                if (ipfsHash != null) {
                    log.info("✅ Identity Profile (FHIR) uploaded to IPFS: {}", ipfsHash);
                    return ipfsHash;
                }
            }

            // Fallback for offline blockchain service: return empty or internal marker
            log.warn("⚠️ Blockchain service unavailable, skipping IPFS upload for Identity.");
            return "";

        } catch (Exception e) {
            log.error("Error generating/uploading FHIR Identity Data", e);
            throw new RuntimeException("Failed to generate FHIR Identity Data", e);
        }
    }

    public String generateFamilyMemberDataJson(FamilyMember member) {
        try {
            // 1. Convert FamilyMember to FHIR Patient resource (Manual or via Mapper)
            org.hl7.fhir.r4.model.Patient fhirPatient = new org.hl7.fhir.r4.model.Patient();

            // Set ID as DID
            if (member.getDid() != null) {
                fhirPatient.setId(member.getDid());
                fhirPatient.addIdentifier().setSystem("http://vaxsafe.com/did").setValue(member.getDid());
            } else {
                fhirPatient.setId("FM-" + member.getId());
            }

            // Set Name
            org.hl7.fhir.r4.model.HumanName name = new org.hl7.fhir.r4.model.HumanName();
            name.setText(member.getFullName());
            fhirPatient.addName(name);

            // Set DOB
            if (member.getDateOfBirth() != null) {
                java.util.Date date = java.util.Date
                        .from(member.getDateOfBirth().atStartOfDay(java.time.ZoneId.systemDefault()).toInstant());
                fhirPatient.setBirthDate(date);
            }

            // Set Gender
            if (member.getGender() != null) {
                switch (member.getGender()) {
                    case MALE -> fhirPatient.setGender(org.hl7.fhir.r4.model.Enumerations.AdministrativeGender.MALE);
                    case FEMALE ->
                        fhirPatient.setGender(org.hl7.fhir.r4.model.Enumerations.AdministrativeGender.FEMALE);
                    default -> fhirPatient.setGender(org.hl7.fhir.r4.model.Enumerations.AdministrativeGender.OTHER);
                }
            }

            // Set Guardian info as Extension
            if (member.getUser() != null) {
                org.hl7.fhir.r4.model.Extension guardianExt = new org.hl7.fhir.r4.model.Extension();
                guardianExt.setUrl("http://vaxsafe.com/fhir/StructureDefinition/guardian-did");
                // Assuming guardian has DID, else use ID
                guardianExt.setValue(new org.hl7.fhir.r4.model.StringType(
                        member.getUser().getDid() != null ? member.getUser().getDid()
                                : String.valueOf(member.getUser().getId())));
                fhirPatient.addExtension(guardianExt);
            }

            // 2. Serialize FHIR resource to JSON string
            String fhirJson = fhirContext.newJsonParser().setPrettyPrint(true).encodeResourceToString(fhirPatient);

            // 3. Upload to IPFS
            if (blockchainService.isBlockchainServiceAvailable()) {
                String ipfsHash = blockchainService.uploadToIpfs(fhirJson);
                if (ipfsHash != null) {
                    log.info("✅ Family Member Identity (FHIR) uploaded to IPFS: {}", ipfsHash);
                    return ipfsHash;
                }
            }

            // Fallback
            log.warn("⚠️ Blockchain service unavailable, skipping IPFS upload for Family Member Identity.");
            return "";

        } catch (Exception e) {
            log.error("Error generating/uploading FHIR Family Member Data", e);
            throw new RuntimeException("Failed to generate FHIR Family Member Data", e);
        }
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
