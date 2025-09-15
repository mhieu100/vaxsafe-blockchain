package com.dapp.backend.dto.mapper;

import com.dapp.backend.dto.response.AppointmentResponse;
import com.dapp.backend.dto.response.DoctorResponse;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.User;

public class UserMapper {
    public static DoctorResponse toResponse(User user) {
        return DoctorResponse.builder()
                .id(user.getId())
                .doctorName(user.getFullName())
                .build();
    }
}
