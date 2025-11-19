package com.dapp.backend.dto.response;

import com.dapp.backend.enums.LeaveStatus;
import com.dapp.backend.enums.LeaveType;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorLeaveResponse {
    Long leaveId;
    Long doctorId;
    String doctorName;
    LocalDate startDate;
    LocalDate endDate;
    String reason;
    LeaveType leaveType;
    LeaveStatus status;
    String approvedByName;
    LocalDateTime approvedAt;
}
