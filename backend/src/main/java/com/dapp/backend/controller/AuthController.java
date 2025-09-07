package com.dapp.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import com.dapp.backend.dto.request.LoginRequest;
import com.dapp.backend.dto.request.RegisterRequest;
import com.dapp.backend.dto.response.LoginResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.model.User;
import com.dapp.backend.dto.mapper.AppointmentMapper;
import com.dapp.backend.dto.response.AppointmentDto;
import com.dapp.backend.service.AppointmentService;
import com.dapp.backend.service.AuthService;

import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.GetMapping;
import org.web3j.model.VaccineAppointment.Appointment;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AppointmentService appointmentService;
    private final JwtUtil jwtUtil;

    @Value("${jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenExpiration;


    @PostMapping("/login/password")
    @ApiMessage("Login email password")
    public ResponseEntity<LoginResponse> loginPassword(@Valid @RequestBody LoginRequest request) throws AppException {
        LoginResponse response = authService.loginPassword(request);
        String refreshToken = jwtUtil.createRefreshToken(request.getUsername());
        authService.updateUserToken(refreshToken, request.getUsername());
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
    @ApiMessage("Register new account")
    public ResponseEntity<User> registerUser(@Valid @RequestBody RegisterRequest request) throws AppException {
        return ResponseEntity.ok(authService.registerUser(request));
    }

    @GetMapping("/refresh")
    @ApiMessage("refresh token")
    public ResponseEntity<LoginResponse> refreshToken(
            @CookieValue(name = "refresh_token", defaultValue = "empty") String refreshToken) throws AppException {
        LoginResponse response = this.authService.refreshToken(refreshToken);
        String newRefreshToken = this.jwtUtil.createRefreshToken(response.getUser().getEmail());
        authService.updateUserToken(newRefreshToken, response.getUser().getEmail());
        this.authService.updateUserToken(newRefreshToken, response.getUser().getEmail());
        ResponseCookie cookie = ResponseCookie
                .from("refresh_token", newRefreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(refreshTokenExpiration)
                .build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(response);
    }


    @GetMapping("/account")
    @ApiMessage("Get profile")
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

//    @GetMapping("/my-appointments")
//    @ApiMessage("Get all appointments of patient")
//    public ResponseEntity<List<AppointmentDto>> getAllAppointmentsOfUser(HttpSession session) throws Exception {
//        String walletAddress = (String) session.getAttribute("walletAddress");
//        List<Appointment> appointments = appointmentService.getAppointmentsByPatient(walletAddress);
//        List<AppointmentDto> dtos = appointments.stream()
//                .map(AppointmentMapper::toDto)
//                .collect(Collectors.toList());
//        return ResponseEntity.ok().body(dtos);
//    }
//
//    @PostMapping("/logout")
//    @ApiMessage("Logout account")
//    public void logoutUser(HttpSession session) {
//        session.removeAttribute("walletAddress");
//    }
}
