package com.dapp.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import com.dapp.backend.model.Role;
import com.dapp.backend.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println(">>> START INIT DATABASE");
        long countRoles = this.roleRepository.count();
        if (countRoles == 0) {
            Role adminRole = new Role();
            Role doctorRole = new Role();
            Role nurseRole = new Role();
            Role patientRole = new Role();
            adminRole.setName("ADMIN");
            doctorRole.setName("DOCTOR");
            nurseRole.setName("NURSE");
            patientRole.setName("PATIENT");
            this.roleRepository.save(adminRole);
            this.roleRepository.save(patientRole);
            this.roleRepository.save(doctorRole);
            this.roleRepository.save(nurseRole);
        }
    }

}
