package com.dapp.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class ConsultationRequest {
    private String query;
    private String age;
    private List<String> vaccinationHistory;
    private String healthCondition;
}
