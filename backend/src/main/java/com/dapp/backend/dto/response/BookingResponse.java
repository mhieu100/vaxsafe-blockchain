package com.dapp.backend.dto.response;

import com.dapp.backend.enums.AppointmentEnum;
import com.dapp.backend.enums.BookingEnum;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingResponse {
    Long bookingId;
    Long patientId;
    String patientName;
    Long familyMemberId;
    String familyMemberName;
    String vaccineName;
    Double totalAmount;
    Integer totalDoses;
    BookingEnum bookingStatus;
    LocalDateTime createdAt;
    List<AppointmentResponse> appointments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class AppointmentResponse {
        Long appointmentId;
        Integer doseNumber;
        LocalDate scheduledDate;
        LocalTime scheduledTime;
        Long centerId;
        String centerName;
        Long doctorId;
        String doctorName;
        Long cashierId;
        String cashierName;
        AppointmentEnum appointmentStatus;
    }
}
