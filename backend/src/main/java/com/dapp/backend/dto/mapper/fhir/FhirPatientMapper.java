package com.dapp.backend.dto.mapper.fhir;

import com.dapp.backend.enums.Gender;
import com.dapp.backend.model.User;
import org.hl7.fhir.r4.model.*;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.util.Date;

@Component
public class FhirPatientMapper {

    /**
     * Maps the internal User and Patient entities to a FHIR Patient resource.
     *
     * @param user           The internal User entity containing basic info (name,
     *                       dob, contact).
     * @param patientProfile The internal Patient entity containing medical
     *                       identifiers (optional).
     * @return A FHIR R4 Patient resource.
     */
    public Patient toFhirPatient(User user, com.dapp.backend.model.Patient patientProfile) {
        if (user == null) {
            return null;
        }

        Patient fhirPatient = new Patient();

        // 1. ID Mapping
        // Using the User ID as the logical ID for the FHIR resource
        fhirPatient.setId(String.valueOf(user.getId()));

        // 2. Name Mapping
        if (user.getFullName() != null) {
            HumanName name = new HumanName();
            name.setUse(HumanName.NameUse.OFFICIAL);
            name.setText(user.getFullName());

            // Simple heuristic to split name (can be improved)
            String[] parts = user.getFullName().trim().split("\\s+");
            if (parts.length > 0) {
                name.setFamily(parts[parts.length - 1]); // Last part as Family name
                for (int i = 0; i < parts.length - 1; i++) {
                    name.addGiven(parts[i]); // Other parts as Given names
                }
            }
            fhirPatient.addName(name);
        }

        // 3. Gender Mapping
        if (user.getGender() != null) {
            if (user.getGender() == Gender.MALE) {
                fhirPatient.setGender(Enumerations.AdministrativeGender.MALE);
            } else if (user.getGender() == Gender.FEMALE) {
                fhirPatient.setGender(Enumerations.AdministrativeGender.FEMALE);
            } else {
                fhirPatient.setGender(Enumerations.AdministrativeGender.OTHER);
            }
        }

        // 4. BirthDate Mapping
        if (user.getBirthday() != null) {
            // Convert LocalDate to java.util.Date
            Date date = Date.from(user.getBirthday().atStartOfDay(ZoneId.systemDefault()).toInstant());
            fhirPatient.setBirthDate(date);
        }

        // 5. Telecom Mapping (Phone & Email)
        if (user.getPhone() != null && !user.getPhone().isEmpty()) {
            ContactPoint phone = new ContactPoint();
            phone.setSystem(ContactPoint.ContactPointSystem.PHONE);
            phone.setValue(user.getPhone());
            phone.setUse(ContactPoint.ContactPointUse.MOBILE);
            fhirPatient.addTelecom(phone);
        }

        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            ContactPoint email = new ContactPoint();
            email.setSystem(ContactPoint.ContactPointSystem.EMAIL);
            email.setValue(user.getEmail());
            fhirPatient.addTelecom(email);
        }

        // 6. Address Mapping
        if (user.getAddress() != null && !user.getAddress().isEmpty()) {
            Address address = new Address();
            address.setText(user.getAddress());
            address.setUse(Address.AddressUse.HOME);
            fhirPatient.addAddress(address);
        }

        // 7. Identifier Mapping (e.g., National ID / CCCD from Patient profile)
        if (patientProfile != null && patientProfile.getIdentityNumber() != null) {
            fhirPatient.addIdentifier()
                    .setSystem("urn:oid:2.16.840.1.113883.4.1") // Example OID for SSN/National ID (Should be customized
                                                                // for Vietnam)
                    .setValue(patientProfile.getIdentityNumber())
                    .setUse(org.hl7.fhir.r4.model.Identifier.IdentifierUse.OFFICIAL);
        }

        // 8. Active Status
        fhirPatient.setActive(user.isActive());

        return fhirPatient;
    }
}
