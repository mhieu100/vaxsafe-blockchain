package com.dapp.backend.dto.response;

import com.dapp.backend.enums.AppointmentEnum;
import com.dapp.backend.enums.BookingEnum;
import com.dapp.backend.enums.OverRallStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long bookingId;
    private Long patientId;
    private String patientName;
    private Long familyMemberId;
    private String familyMemberName;
    private String vaccineName;
    private Double totalAmount;
    private Integer totalDoses;
    private OverRallStatus overallStatus;
    private BookingEnum bookingStatus;
    private LocalDateTime createdAt;
    private List<AppointmentResponse> appointments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AppointmentResponse {
        private Long appointmentId;
        private Integer doseNumber;
        private LocalDate scheduledDate;
        private LocalTime scheduledTime;
        private Long centerId;
        private String centerName;
        private Long doctorId;
        private String doctorName;
        private Long cashierId;
        private String cashierName;
        private AppointmentEnum appointmentStatus;
    }
}
