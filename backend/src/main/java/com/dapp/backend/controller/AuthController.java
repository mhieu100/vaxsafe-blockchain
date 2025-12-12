package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.dto.request.*;
import com.dapp.backend.dto.response.AppointmentResponse;
import com.dapp.backend.dto.response.LoginResponse;
import com.dapp.backend.dto.response.RefreshResponse;
import com.dapp.backend.dto.response.RegisterPatientResponse;
import com.dapp.backend.dto.response.VaccinationRouteResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.security.JwtUtil;
import com.dapp.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

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
    private final com.dapp.backend.service.AppointmentService appointmentService;

    @Value("${jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenExpiration;

    @GetMapping("/my-bookings")
    @ApiMessage("Get booking of user")
    public ResponseEntity<List<AppointmentResponse>> getMyBookings()
            throws Exception {
        return ResponseEntity.ok(appointmentService.getBooking());
    }

    @GetMapping("/booking-history-grouped")
    @ApiMessage("Get grouped vaccination history (routes)")
    public ResponseEntity<List<VaccinationRouteResponse>> getGroupedHistoryBookings()
            throws Exception {
        return ResponseEntity.ok(appointmentService.getGroupedHistoryBooking());
    }

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

        String accessToken = jwtUtil.createAccessToken(registerResponse.getEmail(), registerResponse.getRole());
        String refreshToken = jwtUtil.createRefreshToken(registerResponse.getEmail());
        authService.updateUserToken(refreshToken, registerResponse.getEmail());

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

    @PostMapping("/forgot-password")
    @ApiMessage("Request password reset")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) throws AppException {
        authService.forgotPassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    @ApiMessage("Reset password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) throws AppException {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }

}
