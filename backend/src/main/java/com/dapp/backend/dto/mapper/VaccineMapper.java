package com.dapp.backend.dto.mapper;

import com.dapp.backend.dto.request.VaccineRequest;
import com.dapp.backend.dto.response.VaccineResponse;
import com.dapp.backend.model.Vaccine;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class VaccineMapper {

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
                .injection(toList(v.getInjection()))
                .preserve(toList(v.getPreserve()))
                .contraindications(toList(v.getContraindications()))
                .dosesRequired(v.getDosesRequired())
                .daysForNextDose(v.getDaysForNextDose())
                .duration(v.getDuration())
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
    }

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
                .injection(toString(request.getInjection()))
                .preserve(toString(request.getPreserve()))
                .contraindications(toString(request.getContraindications()))
                .dosesRequired(request.getDosesRequired())
                .daysForNextDose(request.getDaysForNextDose())
                .duration(request.getDuration())
                .build();
    }

    public static void updateEntity(Vaccine vaccine, VaccineRequest request) {
        if (vaccine == null || request == null)
            return;

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

        vaccine.setInjection(toString(request.getInjection()));
        vaccine.setPreserve(toString(request.getPreserve()));
        vaccine.setContraindications(toString(request.getContraindications()));

        vaccine.setDosesRequired(request.getDosesRequired());
        vaccine.setDaysForNextDose(request.getDaysForNextDose());
        vaccine.setDuration(request.getDuration());
    }

    private static List<String> toList(String str) {
        if (str == null || str.isEmpty())
            return new ArrayList<>();
        return Arrays.stream(str.split("\n")).collect(Collectors.toList());
    }

    private static String toString(List<String> list) {
        if (list == null || list.isEmpty())
            return null;
        return String.join("\n", list);
    }
}
