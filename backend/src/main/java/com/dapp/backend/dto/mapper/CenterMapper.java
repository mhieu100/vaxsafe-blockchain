package com.dapp.backend.dto.mapper;

import com.dapp.backend.dto.request.CenterRequest;
import com.dapp.backend.dto.response.CenterResponse;
import com.dapp.backend.model.Center;

public class CenterMapper {

    /**
     * Convert Center entity to CenterResponse DTO
     */
    public static CenterResponse toResponse(Center center) {
        if (center == null) return null;
        return CenterResponse.builder()
                .centerId(center.getCenterId())
                .slug(center.getSlug())
                .name(center.getName())
                .image(center.getImage())
                .address(center.getAddress())
                .phoneNumber(center.getPhoneNumber())
                .capacity(center.getCapacity())
                .workingHours(center.getWorkingHours())
                .createdAt(center.getCreatedAt())
                .updatedAt(center.getUpdatedAt())
                .build();
    }

    /**
     * Convert CenterRequest to Center entity for creation
     */
    public static Center toEntity(CenterRequest request) {
        if (request == null) return null;
        return Center.builder()
                .slug(request.getSlug())
                .name(request.getName())
                .image(request.getImage())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
                .capacity(request.getCapacity())
                .workingHours(request.getWorkingHours())
                .build();
    }

    /**
     * Update existing Center entity with data from CenterRequest
     */
    public static void updateEntity(Center center, CenterRequest request) {
        if (center == null || request == null) return;

        // Only set slug if it's provided (not null or empty)
        if (request.getSlug() != null && !request.getSlug().trim().isEmpty()) {
            center.setSlug(request.getSlug());
        }
        center.setName(request.getName());
        center.setImage(request.getImage());
        center.setAddress(request.getAddress());
        center.setPhoneNumber(request.getPhoneNumber());
        center.setCapacity(request.getCapacity());
        center.setWorkingHours(request.getWorkingHours());
    }
}
