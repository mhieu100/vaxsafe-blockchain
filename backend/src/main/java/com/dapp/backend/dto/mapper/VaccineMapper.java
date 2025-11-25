package com.dapp.backend.dto.mapper;

import com.dapp.backend.dto.request.VaccineRequest;
import com.dapp.backend.dto.response.VaccineResponse;
import com.dapp.backend.model.Vaccine;

public class VaccineMapper {

    /**
     * Convert Vaccine entity to VaccineResponse DTO
     */
    public static VaccineResponse toResponse(Vaccine v) {
        if (v == null)
            return null;
        return VaccineResponse.builder()
                .id(v.getId())
                .slug(v.getSlug())
                .name(v.getName())
                .country(v.getCountry())
                .image(v.getImage())
                .price(v.getPrice())
                .stock(v.getStock())
                .descriptionShort(v.getDescriptionShort())
                .description(v.getDescription())
                .manufacturer(v.getManufacturer())
                .dosesRequired(v.getDosesRequired())
                .duration(v.getDuration())
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
    }

    /**
     * Convert VaccineRequest to Vaccine entity for creation
     */
    public static Vaccine toEntity(VaccineRequest request) {
        if (request == null)
            return null;
        return Vaccine.builder()
                .slug(request.getSlug())
                .name(request.getName())
                .country(request.getCountry())
                .image(request.getImage())
                .price(request.getPrice())
                .stock(request.getStock())
                .descriptionShort(request.getDescriptionShort())
                .description(request.getDescription())
                .manufacturer(request.getManufacturer())
                .dosesRequired(request.getDosesRequired())
                .duration(request.getDuration())
                .build();
    }

    /**
     * Update existing Vaccine entity with data from VaccineRequest
     */
    public static void updateEntity(Vaccine vaccine, VaccineRequest request) {
        if (vaccine == null || request == null)
            return;

        // Only set slug if it's provided (not null or empty)
        if (request.getSlug() != null && !request.getSlug().trim().isEmpty()) {
            vaccine.setSlug(request.getSlug());
        }
        vaccine.setName(request.getName());
        vaccine.setCountry(request.getCountry());
        vaccine.setImage(request.getImage());
        vaccine.setPrice(request.getPrice());
        vaccine.setStock(request.getStock());
        vaccine.setDescriptionShort(request.getDescriptionShort());
        vaccine.setDescription(request.getDescription());
        vaccine.setManufacturer(request.getManufacturer());

        vaccine.setDosesRequired(request.getDosesRequired());
        vaccine.setDuration(request.getDuration());
    }
}
