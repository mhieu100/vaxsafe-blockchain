package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.dto.request.*;
import com.dapp.backend.dto.response.LoginResponse;
import com.dapp.backend.dto.response.RefreshResponse;
import com.dapp.backend.dto.response.RegisterPatientResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.security.JwtUtil;
import com.dapp.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @Value("${jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenExpiration;

    @PostMapping("/login/password")
    @ApiMessage("Login patient")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) throws AppException {
        try {
            LoginResponse response = this.authService.login(request);
            String refreshToken = this.jwtUtil.createRefreshToken(request.getUsername());
            this.authService.updateUserToken(refreshToken, request.getUsername());
            ResponseCookie cookie = ResponseCookie
                    .from("refresh_token", refreshToken)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(refreshTokenExpiration)
                    .build();
            return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(response);
        } catch (BadCredentialsException e) {
            throw new AppException("Invalid username or password");
        } catch (AuthenticationException e) {
            throw new AppException("Authentication failed: " + e.getMessage());
        }
    }

    @PostMapping("/update-password")
    @ApiMessage("Update password")
    public ResponseEntity<Boolean> updatePassword(@Valid @RequestBody UpdatePasswordRequest request)
            throws AppException {
        return ResponseEntity.ok(authService.updatePassword(request));
    }

    @PostMapping("/register")
    @ApiMessage("Register new patient")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterPatientRequest request)
            throws AppException {
        RegisterPatientResponse registerResponse = authService.register(request);

        // Generate tokens for immediate login after registration
        String accessToken = jwtUtil.createAccessToken(registerResponse.getEmail(), registerResponse.getRole());
        String refreshToken = jwtUtil.createRefreshToken(registerResponse.getEmail());
        authService.updateUserToken(refreshToken, registerResponse.getEmail());

        // Create login response with tokens
        LoginResponse.UserLogin userLogin = LoginResponse.UserLogin.builder()
                .id(registerResponse.getId())
                .avatar(registerResponse.getAvatar())
                .fullName(registerResponse.getFullName())
                .email(registerResponse.getEmail())
                .role(registerResponse.getRole())
                .build();

        LoginResponse loginResponse = LoginResponse.builder()
                .accessToken(accessToken)
                .user(userLogin)
                .build();

        ResponseCookie cookie = ResponseCookie
                .from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(refreshTokenExpiration)
                .build();

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(loginResponse);
    }

    @GetMapping("/refresh")
    @ApiMessage("refresh token")
    public ResponseEntity<RefreshResponse> refresh(
            @CookieValue(name = "refresh_token", defaultValue = "empty") String refreshToken) throws AppException {
        LoginResponse login = this.authService.refresh(refreshToken);
        String newRefreshToken = this.jwtUtil.createRefreshToken(login.getUser().getEmail());
        this.authService.updateUserToken(newRefreshToken, login.getUser().getEmail());
        ResponseCookie cookie = ResponseCookie
                .from("refresh_token", newRefreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(refreshTokenExpiration)
                .build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(RefreshResponse.builder().accessToken(login.getAccessToken()).build());
    }

    @GetMapping("/account")
    @ApiMessage("Get current user account")
    public ResponseEntity<LoginResponse.UserLogin> getAccount() throws AppException {
        return ResponseEntity.ok(authService.getAccount());
    }

    @PostMapping("/logout")
    @ApiMessage("logout user")
    public ResponseEntity<Void> logout() throws AppException {

        this.authService.logout();

        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).build();
    }

    @PostMapping("/complete-profile")
    @ApiMessage("Complete patient profile after registration")
    public ResponseEntity<LoginResponse.UserLogin> completeProfile(
            @Valid @RequestBody CompleteProfileRequest request) throws AppException {
        LoginResponse.UserLogin user = authService.completeProfile(request);

        String refreshToken = jwtUtil.createRefreshToken(user.getEmail());
        authService.updateUserToken(refreshToken, user.getEmail());

        ResponseCookie cookie = ResponseCookie
                .from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(refreshTokenExpiration)
                .build();

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(user);
    }

    @PostMapping("/login/google-mobile")
    @ApiMessage("Login with Google (Mobile)")
    public ResponseEntity<LoginResponse> loginGoogleMobile(@Valid @RequestBody GoogleMobileLoginRequest request)
            throws AppException {
        LoginResponse response = authService.loginGoogleMobile(request);

        String refreshToken = jwtUtil.createRefreshToken(response.getUser().getEmail());
        authService.updateUserToken(refreshToken, response.getUser().getEmail());

        ResponseCookie cookie = ResponseCookie
                .from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(refreshTokenExpiration)
                .build();

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(response);
    }

}
