package com.dapp.backend.service;

import com.dapp.backend.dto.request.*;
import com.dapp.backend.dto.response.LoginResponse;
import com.dapp.backend.dto.response.RegisterPatientResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Center;
import com.dapp.backend.model.Patient;
import com.dapp.backend.model.Role;
import com.dapp.backend.repository.PatientRepository;
import com.dapp.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import com.dapp.backend.model.User;
import com.dapp.backend.repository.RoleRepository;
import com.dapp.backend.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;


    private LoginResponse.UserLogin toUserLogin(User user) {
        Patient patient = user.getPatientProfile();
        Center center = user.getCenter();

        return LoginResponse.UserLogin.builder()
                .id(user.getId())
                .avatar(user.getAvatar())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().getName() : null)
                .phone(patient != null ? patient.getPhone() : null)
                .birthday(patient != null ? patient.getBirthday() : null)
                .gender(patient != null && patient.getGender() != null ? patient.getGender().name() : null)
                .address(patient != null ? patient.getAddress() : null)
                .identityNumber(patient != null ? patient.getIdentityNumber() : null)
                .bloodType(patient != null && patient.getBloodType() != null ? patient.getBloodType().name() : null)
                .heightCm(patient != null ? patient.getHeightCm() : null)
                .weightKg(patient != null ? patient.getWeightKg() : null)
                .occupation(patient != null ? patient.getOccupation() : null)
                .lifestyleNotes(patient != null ? patient.getLifestyleNotes() : null)
                .insuranceNumber(patient != null ? patient.getInsuranceNumber() : null)
                .consentForAIAnalysis(patient != null && patient.isConsentForAIAnalysis())
                .centerId(center != null ? center.getId() : null)
                .centerName(center != null ? center.getName() : null)
                .build();
    }

    public LoginResponse login(LoginRequest request) throws AppException {
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());

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

        if (patientRepository.existsByIdentityNumber(request.getPatientProfile().getIdentityNumber())) {
            throw new AppException("IdentityNumber already exists");
        }

        User user = User.builder()
                .avatar("http://localhost:8080/storage/user/default.png")
                .fullName(request.getUser().getFullName())
                .email(request.getUser().getEmail())
                .password(passwordEncoder.encode(request.getUser().getPassword()))
                .isDeleted(false)
                .build();

        Role role = roleRepository.findByName("PATIENT")
                .orElseThrow(() -> new AppException("Role PATIENT not found"));
        user.setRole(role);

        Patient patient = Patient.builder()
                .address(request.getPatientProfile().getAddress())
                .phone(request.getPatientProfile().getPhone())
                .birthday(request.getPatientProfile().getBirthday())
                .gender(request.getPatientProfile().getGender())
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

        userRepository.save(user);

        return RegisterPatientResponse.builder()
                .id(user.getId())
                .avatar(user.getAvatar())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .patientProfile(RegisterPatientResponse.PatientProfileResponse.builder()
                        .id(patient.getId())
                        .address(patient.getAddress())
                        .phone(patient.getPhone())
                        .birthday(patient.getBirthday())
                        .gender(patient.getGender().name())
                        .identityNumber(patient.getIdentityNumber())
                        .bloodType(patient.getBloodType().name())
                        .heightCm(patient.getHeightCm())
                        .weightKg(patient.getWeightKg())
                        .occupation(patient.getOccupation())
                        .lifestyleNotes(patient.getLifestyleNotes())
                        .insuranceNumber(patient.getInsuranceNumber())
                        .consentForAIAnalysis(patient.isConsentForAIAnalysis())
                        .build())
                .build();
    }

    public LoginResponse.UserLogin updateAccount(UpdateAccountRequest request) throws AppException {
        User user = getCurrentUserLogin();
        user.setFullName(request.getUser().getFullName());

        Patient patient = user.getPatientProfile();
        patient.setAddress(request.getPatientProfile().getAddress());
        patient.setPhone(request.getPatientProfile().getPhone());
        patient.setBirthday(request.getPatientProfile().getBirthday());
        patient.setGender(request.getPatientProfile().getGender());
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
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new AppException("User not found"));

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

    public User getCurrentUserLogin()throws AppException {
        String email = JwtUtil.getCurrentEmailLogin().isPresent() ? JwtUtil.getCurrentEmailLogin().get() : "";
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException("User not found"));
    }
}
