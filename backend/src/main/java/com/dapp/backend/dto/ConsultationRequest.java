package com.dapp.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ConsultationRequest {
    private String query;
    private String age; // e.g., "2 months", "5 years"
    private List<String> vaccinationHistory; // e.g., ["Hepatitis B dose 1", "BCG"]
    private String healthCondition; // e.g., "Healthy", "Fever", "Allergy to eggs"
}
