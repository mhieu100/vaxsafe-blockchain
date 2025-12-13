package com.dapp.backend.service;

import java.time.LocalDateTime;
import java.util.UUID;

import com.dapp.backend.dto.request.*;
import com.dapp.backend.dto.response.LoginResponse;
import com.dapp.backend.dto.response.RegisterPatientResponse;
import com.dapp.backend.enums.IdentityType;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Center;
import com.dapp.backend.model.Patient;
import com.dapp.backend.model.Role;
import com.dapp.backend.model.User;
import com.dapp.backend.repository.PatientRepository;
import com.dapp.backend.repository.RoleRepository;
import com.dapp.backend.repository.UserRepository;
import com.dapp.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final IdentityService identityService;
    private final BlockchainService blockchainService;
    private final NotificationLogService notificationLogService;

    @org.springframework.beans.factory.annotation.Value("${google.mobile.client-id}")
    private String googleClientId;

    @org.springframework.beans.factory.annotation.Value("${frontend.url:https://safevax.mhieu100.space}")
    private String frontendUrl;

    private final EmailService emailService;

    private LoginResponse.UserLogin toUserLogin(User user) {
        Patient patient = user.getPatientProfile();

        Center center = null;
        if (user.getDoctor() != null) {
            center = user.getDoctor().getCenter();
        } else if (user.getCashier() != null) {
            center = user.getCashier().getCenter();
        }

        return LoginResponse.UserLogin.builder()
                .id(user.getId())
                .avatar(user.getAvatar())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().getName() : null)
                .isActive(user.isActive())
                .isNewUser(user.isNewUser())
                .phone(user.getPhone())
                .birthday(user.getBirthday())
                .gender(user.getGender() != null ? user.getGender().name() : null)
                .address(user.getAddress())
                .identityNumber(patient != null ? patient.getIdentityNumber() : null)
                .bloodType(patient != null && patient.getBloodType() != null ? patient.getBloodType().name() : null)
                .heightCm(patient != null ? patient.getHeightCm() : null)
                .weightKg(patient != null ? patient.getWeightKg() : null)
                .occupation(patient != null ? patient.getOccupation() : null)
                .lifestyleNotes(patient != null ? patient.getLifestyleNotes() : null)
                .insuranceNumber(patient != null ? patient.getInsuranceNumber() : null)
                .consentForAIAnalysis(patient != null && patient.isConsentForAIAnalysis())
                .centerId(center != null ? center.getCenterId() : null)
                .centerName(center != null ? center.getName() : null)
                .build();
    }

    public LoginResponse login(LoginRequest request) throws AppException {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty() ||
                request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new AppException("Invalid username or password");
        }

        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                request.getUsername(), request.getPassword());

        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getUsername())
                .orElseThrow(() -> new AppException("User not found"));

        String accessToken = jwtUtil.createAccessToken(request.getUsername(), user.getRole().getName());

        ensureBlockchainIdentity(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .user(toUserLogin(user))
                .build();
    }

    public RegisterPatientResponse register(RegisterPatientRequest request) throws AppException {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email already exists");
        }

        User user = User.builder()
                .avatar(request.getAvatar() != null ? request.getAvatar()
                        : "https://res-console.cloudinary.com/dcwzhi4tp/thumbnails/v1/image/upload/v1763975729/dmgxY3h1aWtkYmh5aXFqeGJnaG0=/drilldown")
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .isDeleted(false)
                .isActive(false)
                .build();

        Role role = roleRepository.findByName("PATIENT")
                .orElseThrow(() -> new AppException("Role PATIENT not found"));
        user.setRole(role);

        User savedUser = userRepository.save(user);

        try {
            notificationLogService.createDefaultSettings(savedUser);
            log.info("Default notification settings created for user: {}", savedUser.getEmail());
        } catch (Exception e) {
            log.error("Error creating notification settings for user: {}", savedUser.getEmail(), e);

        }

        try {
            String identityHash = identityService.generateUserIdentityHash(savedUser);
            String did = identityService.generateDID(identityHash, IdentityType.ADULT);
            String ipfsDataHash = identityService.generateIdentityDataJson(savedUser);

            savedUser.setBlockchainIdentityHash(identityHash);
            savedUser.setDid(did);
            savedUser.setIpfsDataHash(ipfsDataHash);

            savedUser = userRepository.save(savedUser);

            log.info("Identity hash generated for user: {} (will sync to blockchain after profile completion)",
                    savedUser.getEmail());
        } catch (Exception e) {
            log.error("Error generating identity hash for user: {}", savedUser.getEmail(), e);

        }

        return RegisterPatientResponse.builder()
                .id(savedUser.getId())
                .avatar(savedUser.getAvatar())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().getName())
                .isActive(savedUser.isActive())
                .build();
    }

    public LoginResponse.UserLogin updateAccount(UpdateAccountRequest request) throws AppException {
        User user = getCurrentUserLogin();
        user.setFullName(request.getUser().getFullName());

        user.setAddress(request.getPatientProfile().getAddress());
        user.setPhone(request.getPatientProfile().getPhone());
        user.setBirthday(request.getPatientProfile().getBirthday());
        user.setGender(request.getPatientProfile().getGender());

        Patient patient = user.getPatientProfile();
        patient.setIdentityNumber(request.getPatientProfile().getIdentityNumber());
        patient.setBloodType(request.getPatientProfile().getBloodType());
        patient.setHeightCm(request.getPatientProfile().getHeightCm());
        patient.setWeightKg(request.getPatientProfile().getWeightKg());
        patient.setOccupation(request.getPatientProfile().getOccupation());
        patient.setLifestyleNotes(request.getPatientProfile().getLifestyleNotes());
        patient.setInsuranceNumber(request.getPatientProfile().getInsuranceNumber());

        user.setPatientProfile(patient);
        userRepository.save(user);

        return toUserLogin(user);
    }

    public LoginResponse refresh(String refreshToken) throws AppException {
        if (refreshToken.equals("empty")) {
            throw new AppException("Missing refresh token!");
        }

        Jwt decodedToken = jwtUtil.checkValidRefreshToken(refreshToken);
        String email = decodedToken.getSubject();

        User user = this.userRepository.findByRefreshTokenAndEmail(refreshToken, email);
        if (user == null) {
            throw new AppException("Refresh token invalid!");
        }
        String newAccessToken = jwtUtil.createAccessToken(user.getEmail(), user.getRole().getName());
        ensureBlockchainIdentity(user);
        return LoginResponse.builder().accessToken(newAccessToken).user(toUserLogin(user)).build();
    }

    public LoginResponse.UserLogin updateAvatar(AvatarRequest request) throws AppException {
        User user = getCurrentUserLogin();
        user.setAvatar(request.getAvatarUrl());
        return toUserLogin(this.userRepository.save(user));
    }

    public boolean updatePassword(UpdatePasswordRequest request) throws AppException {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return false;
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return true;
    }

    public LoginResponse.UserLogin getAccount() throws AppException {
        User user = getCurrentUserLogin();
        return toUserLogin(user);
    }

    public void updateUserToken(String token, String email) throws AppException {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException("User not foud"));
        user.setRefreshToken(token);
        this.userRepository.save(user);
    }

    public void logout() throws AppException {
        User user = getCurrentUserLogin();
        user.setRefreshToken(null);
        this.userRepository.save(user);
    }

    public User getCurrentUserLogin() throws AppException {
        String email = JwtUtil.getCurrentEmailLogin().isPresent() ? JwtUtil.getCurrentEmailLogin().get() : "";
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException("User not found"));
    }

    public LoginResponse.UserLogin completeProfile(CompleteProfileRequest request) throws AppException {
        User user = getCurrentUserLogin();

        if (user.getPatientProfile() != null) {
            throw new AppException("Profile already completed");
        }

        if (patientRepository.existsByIdentityNumber(request.getIdentityNumber())) {
            throw new AppException("Identity number already exists");
        }

        user.setAddress(request.getAddress());
        user.setPhone(request.getPhone());
        user.setBirthday(request.getBirthday());
        user.setGender(request.getGender());

        Patient patient = Patient.builder()
                .identityNumber(request.getIdentityNumber())
                .bloodType(request.getBloodType())
                .heightCm(request.getHeightCm())
                .weightKg(request.getWeightKg())
                .occupation(request.getOccupation())
                .lifestyleNotes(request.getLifestyleNotes())
                .insuranceNumber(request.getInsuranceNumber())
                .consentForAIAnalysis(request.isConsentForAIAnalysis())
                .user(user)
                .build();

        user.setPatientProfile(patient);
        user.setActive(true);
        user.setNewUser(false);

        generateAndSyncBlockchainIdentity(user);

        return toUserLogin(user);
    }

    private void generateAndSyncBlockchainIdentity(User user) {
        try {

            String identityHash = identityService.generateUserIdentityHash(user);
            String did = identityService.generateDID(identityHash, IdentityType.ADULT);

            user.setBlockchainIdentityHash(identityHash);
            user.setDid(did);

            String ipfsDataHash = identityService.generateIdentityDataJson(user);
            user.setIpfsDataHash(ipfsDataHash);

            log.info("\n" +
                    "╔═══════════════════════════════════════════════════════════════════╗\n" +
                    "║           🔐 IDENTITY HASH GENERATED                              ║\n" +
                    "╠═══════════════════════════════════════════════════════════════════╣\n" +
                    "║  👤 User: {}\n" +
                    "║  🆔 Hash: {}\n" +
                    "║  📱 DID: {}\n" +
                    "╚═══════════════════════════════════════════════════════════════════╝",
                    user.getEmail(), identityHash, did);

            userRepository.save(user);

            if (blockchainService.isBlockchainServiceAvailable()) {
                var response = blockchainService.createIdentity(
                        identityHash,
                        did,
                        IdentityType.ADULT,
                        ipfsDataHash,
                        user.getEmail());
                if (response != null && response.isSuccess()) {
                    log.info("\n" +
                            "╔═══════════════════════════════════════════════════════════════════╗\n" +
                            "║           ⛓️  BLOCKCHAIN IDENTITY CREATED                         ║\n" +
                            "╠═══════════════════════════════════════════════════════════════════╣\n" +
                            "║  👤 User: {}\n" +
                            "║  📜 TxHash: {}\n" +
                            "║  ✅ Status: SUCCESS\n" +
                            "╚═══════════════════════════════════════════════════════════════════╝",
                            user.getEmail(), response.getData().getTransactionHash());
                } else {
                    log.warn("Failed to create blockchain identity for user: {} - {}",
                            user.getEmail(), response != null ? response.getMessage() : "null response");
                }
            } else {
                log.warn("Blockchain service not available, identity saved to database only");
            }
        } catch (Exception e) {
            userRepository.save(user);
        }
    }

    // Self-healing: Check if user has profile but missing blockchain identity
    private void ensureBlockchainIdentity(User user) {
        try {
            if ("PATIENT".equals(user.getRole().getName()) && user.getPatientProfile() != null) {
                // If they have Identity Number (profile complete)
                if (user.getPatientProfile().getIdentityNumber() != null &&
                        !user.getPatientProfile().getIdentityNumber().isEmpty()) {

                    boolean changed = false;

                    // If active is false but they have profile, fix it
                    if (!user.isActive()) {
                        user.setActive(true);
                        user.setNewUser(false);
                        changed = true;
                    }

                    // If hash missing, generate it
                    if (user.getBlockchainIdentityHash() == null || user.getBlockchainIdentityHash().isEmpty()) {
                        log.info("Self-healing: Generating missing blockchain identity for user {}", user.getEmail());
                        generateAndSyncBlockchainIdentity(user);
                        changed = false; // saved inside generateAndSync
                    } else if (changed) {
                        userRepository.save(user);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error in ensureBlockchainIdentity for user {}", user.getEmail(), e);
        }
    }

    public LoginResponse loginGoogleMobile(GoogleMobileLoginRequest request) throws AppException {
        try {

            com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier verifier = new com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.Builder(
                    new com.google.api.client.http.javanet.NetHttpTransport(),
                    new com.google.api.client.json.gson.GsonFactory())
                    .setAudience(java.util.Collections.singletonList(googleClientId))
                    .build();

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken idToken = verifier.verify(request.getIdToken());

            if (idToken == null) {
                throw new AppException("Invalid Google ID Token");
            }

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {

                Role role = roleRepository.findByName("PATIENT")
                        .orElseThrow(() -> new AppException("Role PATIENT not found"));

                user = User.builder()
                        .email(email)
                        .fullName(name)
                        .avatar(pictureUrl)
                        .role(role)
                        .isActive(false)
                        .isDeleted(false)
                        .password(passwordEncoder.encode("GOOGLE_AUTH_" + java.util.UUID.randomUUID()))
                        .build();

                user = userRepository.save(user);

                try {
                    notificationLogService.createDefaultSettings(user);
                    log.info("Default notification settings created for Google user: {}", user.getEmail());
                } catch (Exception e) {
                    log.error("Error creating notification settings for Google user: {}", user.getEmail(), e);
                }
            } else {
                // SMART MERGE: User exists (registered via password or other)
                if (user.isDeleted()) {
                    throw new AppException("Account has been disabled/deleted.");
                }

                // Auto-update Avatar if using default and Google provided one
                boolean changed = false;
                String defaultAvatar = "https://res-console.cloudinary.com/dcwzhi4tp/thumbnails/v1/image/upload/v1763975729/dmgxY3h1aWtkYmh5aXFqeGJnaG0=/drilldown";
                if (pictureUrl != null && (user.getAvatar() == null || user.getAvatar().equals(defaultAvatar))) {
                    user.setAvatar(pictureUrl);
                    changed = true;
                }

                // If they registered via Password, they might be 'Active' but missing
                // 'isActive' flag in some legacy cases,
                // but usually we trust existing state.

                if (changed) {
                    userRepository.save(user);
                }
            }

            String accessToken = jwtUtil.createAccessToken(email, user.getRole().getName());

            ensureBlockchainIdentity(user);

            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .user(toUserLogin(user))
                    .build();

        } catch (Exception e) {
            log.error("Error verifying Google ID Token", e);
            throw new AppException("Google authentication failed: " + e.getMessage());
        }
    }

    public void forgotPassword(ForgotPasswordRequest request) throws AppException {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException("User not found"));

        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        String resetLink = frontendUrl + "/reset-password?token=" + token;

        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink);
        } catch (Exception e) {
            log.error("Failed to send password reset email", e);
            throw new AppException("Failed to send email");
        }
    }

    public void resetPassword(ResetPasswordRequest request) throws AppException {
        User user = userRepository.findByResetPasswordToken(request.getToken())
                .orElseThrow(() -> new AppException("Invalid or expired password reset token"));

        if (user.getResetPasswordExpiry().isBefore(LocalDateTime.now())) {
            throw new AppException("Token expired");
        }

        log.info("Resetting password for user: {}", user.getEmail());
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiry(null);
        userRepository.save(user);
        log.info("Password reset successfully for user: {}", user.getEmail());
    }
}
