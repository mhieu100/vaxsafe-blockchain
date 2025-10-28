package com.dapp.backend.controller;

import com.dapp.backend.dto.request.AvatarRequest;
import com.dapp.backend.dto.request.LoginRequest;
import com.dapp.backend.dto.request.RegisterPatientRequest;
import com.dapp.backend.dto.request.UpdateAccountRequest;
import com.dapp.backend.dto.response.BookingResponse;
import com.dapp.backend.dto.response.LoginResponse;
import com.dapp.backend.dto.response.RefreshResponse;
import com.dapp.backend.dto.response.RegisterPatientResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.security.JwtUtil;
import com.dapp.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.service.AuthService;

import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final BookingService bookingService;
    private final JwtUtil jwtUtil;

    @Value("${jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenExpiration;

    @PostMapping("/login/password")
    @ApiMessage("Login patient")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) throws AppException {
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
    }

    @PostMapping("/register")
    @ApiMessage("Register new patient")
    public ResponseEntity<RegisterPatientResponse> register(@Valid @RequestBody RegisterPatientRequest request) throws AppException {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/refresh")
    @ApiMessage("refresh token")
    public ResponseEntity<RefreshResponse> refresh(@CookieValue(name = "refresh_token", defaultValue = "empty") String refreshToken) throws AppException {
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
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(RefreshResponse.builder().accessToken(login.getAccessToken()).build());
    }

    @PostMapping("/update-account")
    @ApiMessage("Update account")
    public ResponseEntity<LoginResponse.UserLogin> update(@Valid @RequestBody UpdateAccountRequest request) throws AppException {
        return ResponseEntity.ok(authService.updateAccount(request));
    }

    @GetMapping("/account")
    @ApiMessage("Get profile")
    public ResponseEntity<LoginResponse.UserLogin> getProfile() throws AppException {
        return ResponseEntity.ok(authService.getAccount());
    }

    @GetMapping("/booking")
    @ApiMessage("Get booking of user")
    public ResponseEntity<List<BookingResponse>> getBooking() throws AppException {
        return ResponseEntity.ok(bookingService.getBooking());
    }

    @GetMapping("/history-booking")
    @ApiMessage("Get history booking of user")
    public ResponseEntity<List<BookingResponse>> getHistoryBooking() throws AppException {
        return ResponseEntity.ok(bookingService.getHistoryBooking());
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

    @PostMapping("/avatar")
    @ApiMessage("update avatar")
    public ResponseEntity<LoginResponse.UserLogin> updateAvatar(@RequestBody AvatarRequest request) throws AppException {
        return ResponseEntity.ok(this.authService.updateAvatar(request));
    }


}
