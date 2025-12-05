package com.dapp.backend.controller;

import com.dapp.backend.dto.response.CashierDashboardStatsResponse;
import com.dapp.backend.dto.response.DashboardStatsResponse;
import com.dapp.backend.dto.response.DoctorDashboardStatsResponse;
import com.dapp.backend.model.User;
import com.dapp.backend.repository.UserRepository;
import com.dapp.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/doctor-stats")
    public ResponseEntity<DoctorDashboardStatsResponse> getDoctorStats() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()
                .getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(dashboardService.getDoctorStats(user.getId()));
    }

    @GetMapping("/cashier-stats")
    public ResponseEntity<CashierDashboardStatsResponse> getCashierStats() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()
                .getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(dashboardService.getCashierStats(user.getId()));
    }
}
