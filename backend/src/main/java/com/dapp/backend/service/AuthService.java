package com.dapp.backend.service;

import com.dapp.backend.dto.request.LoginRequest;
import com.dapp.backend.dto.request.RegisterRequest;
import com.dapp.backend.dto.response.LoginResponse;
import com.dapp.backend.exception.AppException;
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

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse.UserLogin toUserLogin(User user) {
        return LoginResponse.UserLogin.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .birthday(user.getBirthday())
                .address(user.getAddress())
                .role(user.getRole().getName())
                .walletAddress(user.getWalletAddress())
                .centerName(!Objects.equals(user.getRole().getName(), "DOCTOR") &&
                        !Objects.equals(user.getRole().getName(), "CASHIER") ? "": user.getCenter().getName() )
                .build();
    }

    public LoginResponse loginPassword(LoginRequest request) throws AppException {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                request.getUsername(), request.getPassword());
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getUsername())
                .orElseThrow(() -> new AppException("User not found"));

        String accessToken = jwtUtil.createAccessToken(request.getUsername());
        return LoginResponse.builder().accessToken(accessToken).user(toUserLogin(user)).build();
    }

    public User registerUser(RegisterRequest request) throws AppException {
        if(userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email already exists ");
        }
        String hashPassword = passwordEncoder.encode(request.getPassword());
        return userRepository.save(User.builder().fullName(request.getFullName()).email(request.getEmail()).password(hashPassword).role(roleRepository.findByName("PATIENT")).build());
    }

    public LoginResponse refreshToken(String refreshToken) throws AppException {
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


    public LoginResponse.UserLogin getAccount() throws AppException {
        String email = JwtUtil.getCurrentUserLogin().isPresent() ? JwtUtil.getCurrentUserLogin().get() : "";
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException("User not found"));
        return toUserLogin(user);
    }

    public void updateUserToken(String token, String email) throws AppException {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException("User not foud"));
        user.setRefreshToken(token);
        this.userRepository.save(user);
    }

    public void logout() throws AppException {
        String email = JwtUtil.getCurrentUserLogin().isPresent() ? JwtUtil.getCurrentUserLogin().get() : "";
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException("User not foud"));
        user.setRefreshToken(null);
        this.userRepository.save(user);
    }
}
