package com.dapp.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

  /**
   * Health check endpoint - accessible without authentication
   * Used for CI/CD pipeline testing
   */
  @GetMapping("/hello")
  public ResponseEntity<HealthResponse> hello() {
    return ResponseEntity.ok(
        HealthResponse.builder()
            .message("Hello from VaxSafe Backend! update ci cd")
            .status("OK")
            .build()
    );
  }

  /**
   * Secure hello endpoint - requires authentication
   */
  @GetMapping("/hello-secure")
  public ResponseEntity<HealthResponse> helloSecure() {
    return ResponseEntity.ok(
        HealthResponse.builder()
            .message("Hello from VaxSafe Backend (Secure)!")
            .status("OK")
            .build()
    );
  }
}
