package com.dapp.backend.controller;

import com.dapp.backend.dto.request.UpdateAccountRequest;
import com.dapp.backend.dto.response.LoginResponse;
import com.dapp.backend.enums.BloodType;
import com.dapp.backend.enums.Gender;
import com.dapp.backend.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    public void testUpdateAccount() throws Exception {
        // Given
        UpdateAccountRequest.UserRequest userRequest = new UpdateAccountRequest.UserRequest();
        userRequest.setFullName("John Doe Updated");

        UpdateAccountRequest.PatientProfileRequest patientProfileRequest = new UpdateAccountRequest.PatientProfileRequest();
        patientProfileRequest.setAddress("123 New Street");
        patientProfileRequest.setPhone("0987654321");
        patientProfileRequest.setBirthday(LocalDate.of(1991, 1, 1));
        patientProfileRequest.setGender(Gender.MALE);
        patientProfileRequest.setIdentityNumber("1234567890");
        patientProfileRequest.setBloodType(BloodType.A);
        patientProfileRequest.setHeightCm(180.0);
        patientProfileRequest.setWeightKg(75.0);
        patientProfileRequest.setOccupation("Software Engineer");
        patientProfileRequest.setLifestyleNotes("Active");
        patientProfileRequest.setInsuranceNumber("INS-12345");
        patientProfileRequest.setConsentForAIAnalysis(true);

        UpdateAccountRequest request = new UpdateAccountRequest(userRequest, patientProfileRequest);

        LoginResponse.UserLogin userLoginResponse = LoginResponse.UserLogin.builder()
                .id(1L)
                .fullName("John Doe Updated")
                .email("test@example.com")
                .role("PATIENT")
                .address("123 New Street")
                .phone("0987654321")
                .build();

        when(authService.updateAccount(any(UpdateAccountRequest.class))).thenReturn(userLoginResponse);

        // When & Then
        mockMvc.perform(post("/auth/update-account")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName").value("John Doe Updated"))
                .andExpect(jsonPath("$.data.address").value("123 New Street"))
                .andExpect(jsonPath("$.data.phone").value("0987654321"));
    }
}
