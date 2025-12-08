package com.dapp.backend.dto.response;

import com.dapp.backend.enums.AppointmentStatus;
import com.dapp.backend.enums.BookingEnum;
import com.dapp.backend.enums.TimeSlotEnum;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    String vaccineSlug;
    Double totalAmount;
    Integer totalDoses;
    Integer vaccineTotalDoses;
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
        TimeSlotEnum scheduledTimeSlot;
        java.time.LocalTime actualScheduledTime;
        Long centerId;
        String centerName;
        Long doctorId;
        String doctorName;
        Long cashierId;
        String cashierName;
        AppointmentStatus appointmentStatus;
    }
}
