package com.dapp.backend.service.spec;

import com.dapp.backend.model.Appointment;
import org.springframework.data.jpa.domain.Specification;

public class AppointmentSpecifications {
    public static Specification<Appointment> findByCenter(String centerName) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.like(root.get("center").get("name"), centerName);
    }

    public static Specification<Appointment> findByDoctor(String doctorName) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.like(root.get("doctor").get("fullName"), doctorName);
    }
}
