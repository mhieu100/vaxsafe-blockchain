package com.dapp.backend.service.spec;

import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.User;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecifications {
    public static Specification<User> findByRole() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("role").get("name"), "DOCTOR");
    }

    public static Specification<User> findByCenter(String centerName) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("center").get("name"), centerName);
    }
}
