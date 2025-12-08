package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

  
  @GetMapping("/hello")
  @ApiMessage("Health check endpoint")
  public ResponseEntity<HealthResponse> hello() {
    return ResponseEntity.ok(
        HealthResponse.builder()
            .message("Hello from VaxSafe Backend! update ci cd 1234")
            .status("OK")
            .build());
  }
}
