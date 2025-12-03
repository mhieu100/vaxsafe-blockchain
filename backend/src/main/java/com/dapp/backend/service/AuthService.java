package com.dapp.backend.service;

import com.dapp.backend.dto.request.*;
import com.dapp.backend.dto.response.LoginResponse;
import com.dapp.backend.dto.response.RegisterPatientResponse;
import com.dapp.backend.enums.IdentityType;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Center;
import com.dapp.backend.model.Patient;
import com.dapp.backend.model.Role;
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

import com.dapp.backend.model.User;

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

    private LoginResponse.UserLogin toUserLogin(User user) {
        Patient patient = user.getPatientProfile();

        // Get center from Doctor or Cashier profile
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
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                request.getUsername(), request.getPassword());

        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getUsername())
                .orElseThrow(() -> new AppException("User not found"));

        String accessToken = jwtUtil.createAccessToken(request.getUsername());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .user(toUserLogin(user))
                .build();
    }

    public RegisterPatientResponse register(RegisterPatientRequest request) throws AppException {
        if (userRepository.existsByEmail(request.getUser().getEmail())) {
            throw new AppException("Email already exists");
        }

        User user = User.builder()
                .avatar("https://res-console.cloudinary.com/dcwzhi4tp/thumbnails/v1/image/upload/v1763975729/dmgxY3h1aWtkYmh5aXFqeGJnaG0=/drilldown")
                .fullName(request.getUser().getFullName())
                .email(request.getUser().getEmail())
                .password(passwordEncoder.encode(request.getUser().getPassword()))
                .isDeleted(false)
                .isActive(false) // Account is inactive until profile is completed
                .build();

        Role role = roleRepository.findByName("PATIENT")
                .orElseThrow(() -> new AppException("Role PATIENT not found"));
        user.setRole(role);

        // Save user first to get ID
        User savedUser = userRepository.save(user);

        // Create default notification settings for new user
        try {
            notificationLogService.createDefaultSettings(savedUser);
            log.info("Default notification settings created for user: {}", savedUser.getEmail());
        } catch (Exception e) {
            log.error("Error creating notification settings for user: {}", savedUser.getEmail(), e);
            // Continue - user is still created successfully
        }

        // Generate blockchain identity hash (deterministic, based on email + name)
        // Will be synced to blockchain later when profile is completed (has birthday)
        try {
            String identityHash = identityService.generateUserIdentityHash(savedUser);
            String did = identityService.generateDID(identityHash, IdentityType.ADULT);
            String ipfsDataHash = identityService.generateIdentityDataJson(savedUser);

            savedUser.setBlockchainIdentityHash(identityHash);
            savedUser.setDid(did);
            savedUser.setIpfsDataHash(ipfsDataHash);

            // Save to database (blockchain sync will happen in completeProfile)
            savedUser = userRepository.save(savedUser);

            log.info("Identity hash generated for user: {} (will sync to blockchain after profile completion)",
                    savedUser.getEmail());
        } catch (Exception e) {
            log.error("Error generating identity hash for user: {}", savedUser.getEmail(), e);
            // Continue - user is still created in database
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

        // Update common fields on user
        user.setAddress(request.getPatientProfile().getAddress());
        user.setPhone(request.getPatientProfile().getPhone());
        user.setBirthday(request.getPatientProfile().getBirthday());
        user.setGender(request.getPatientProfile().getGender());

        // Update patient-specific fields
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
        String newAccessToken = jwtUtil.createAccessToken(user.getEmail());
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

    /**
     * Complete profile for users registered via password or Google
     * This method is used for the unified complete-profile flow
     */
    public LoginResponse.UserLogin completeProfile(CompleteProfileRequest request) throws AppException {
        User user = getCurrentUserLogin();

        if (user.getPatientProfile() != null) {
            throw new AppException("Profile already completed");
        }

        if (patientRepository.existsByIdentityNumber(request.getPatientProfile().getIdentityNumber())) {
            throw new AppException("Identity number already exists");
        }

        // Set common fields on user
        user.setAddress(request.getPatientProfile().getAddress());
        user.setPhone(request.getPatientProfile().getPhone());
        user.setBirthday(request.getPatientProfile().getBirthday());
        user.setGender(request.getPatientProfile().getGender());

        // Create patient profile with patient-specific fields
        Patient patient = Patient.builder()
                .identityNumber(request.getPatientProfile().getIdentityNumber())
                .bloodType(request.getPatientProfile().getBloodType())
                .heightCm(request.getPatientProfile().getHeightCm())
                .weightKg(request.getPatientProfile().getWeightKg())
                .occupation(request.getPatientProfile().getOccupation())
                .lifestyleNotes(request.getPatientProfile().getLifestyleNotes())
                .insuranceNumber(request.getPatientProfile().getInsuranceNumber())
                .consentForAIAnalysis(request.getPatientProfile().isConsentForAIAnalysis())
                .user(user)
                .build();

        user.setPatientProfile(patient);
        user.setActive(true); // Activate account after completing profile

        // Generate and sync identity to blockchain
        generateAndSyncBlockchainIdentity(user);

        return toUserLogin(user);
    }

    private void generateAndSyncBlockchainIdentity(User user) {
        try {
            // Generate identity data
            String identityHash = identityService.generateUserIdentityHash(user);
            String did = identityService.generateDID(identityHash, IdentityType.ADULT);
            String ipfsDataHash = identityService.generateIdentityDataJson(user);

            user.setBlockchainIdentityHash(identityHash);
            user.setDid(did);
            user.setIpfsDataHash(ipfsDataHash);

            log.info("Generated identity hash for user: {}", user.getEmail());

            // Save to database first
            userRepository.save(user);

            // Sync to blockchain
            if (blockchainService.isBlockchainServiceAvailable()) {
                var response = blockchainService.createIdentity(
                        identityHash,
                        did,
                        IdentityType.ADULT,
                        ipfsDataHash,
                        user.getEmail());
                if (response != null && response.isSuccess()) {
                    log.info("Blockchain identity created for user: {} (txHash: {})",
                            user.getEmail(), response.getData().getTransactionHash());
                } else {
                    log.warn("Failed to create blockchain identity for user: {} - {}",
                            user.getEmail(), response != null ? response.getMessage() : "null response");
                }
            } else {
                log.warn("Blockchain service not available, identity saved to database only");
            }
        } catch (Exception e) {
            log.error("Error syncing blockchain identity for user: {}", user.getEmail(), e);
            // Ensure user is saved even if blockchain sync fails
            userRepository.save(user);
        }
    }

    public LoginResponse loginGoogleMobile(GoogleMobileLoginRequest request) throws AppException {
        try {
            // 1. Verify ID Token
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

            // 2. Check if user exists
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                // Register new user
                Role role = roleRepository.findByName("PATIENT")
                        .orElseThrow(() -> new AppException("Role PATIENT not found"));

                user = User.builder()
                        .email(email)
                        .fullName(name)
                        .avatar(pictureUrl)
                        .role(role)
                        .isActive(false) // Inactive until profile completed
                        .isDeleted(false)
                        .password(passwordEncoder.encode("GOOGLE_AUTH_" + java.util.UUID.randomUUID())) // Dummy
                                                                                                        // password
                        .build();

                user = userRepository.save(user);

                // Create default notification settings for new Google user
                try {
                    notificationLogService.createDefaultSettings(user);
                    log.info("Default notification settings created for Google user: {}", user.getEmail());
                } catch (Exception e) {
                    log.error("Error creating notification settings for Google user: {}", user.getEmail(), e);
                    // Continue - user is still created successfully
                }
            }

            // 3. Generate Tokens
            String accessToken = jwtUtil.createAccessToken(email);

            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .user(toUserLogin(user))
                    .build();

        } catch (Exception e) {
            log.error("Error verifying Google ID Token", e);
            throw new AppException("Google authentication failed: " + e.getMessage());
        }
    }
}
