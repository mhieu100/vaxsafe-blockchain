package com.dapp.backend.dto.mapper.fhir;

import com.dapp.backend.enums.Gender;
import com.dapp.backend.model.User;
import org.hl7.fhir.r4.model.*;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.util.Date;

@Component
public class FhirPatientMapper {

    public Patient toFhirPatient(User user, com.dapp.backend.model.Patient patientProfile) {
        if (user == null) {
            return null;
        }

        Patient fhirPatient = new Patient();

        // Use DID as the primary FHIR ID if available, otherwise fallback to DB ID
        if (user.getDid() != null) {
            fhirPatient.setId(user.getDid());
            // Also add DID as an Identifier
            fhirPatient.addIdentifier()
                    .setSystem("http://vaxsafe.com/did")
                    .setValue(user.getDid())
                    .setUse(Identifier.IdentifierUse.OFFICIAL);
        } else {
            fhirPatient.setId(String.valueOf(user.getId()));
        }

        if (user.getFullName() != null) {
            HumanName name = new HumanName();
            name.setUse(HumanName.NameUse.OFFICIAL);
            name.setText(user.getFullName());

            String[] parts = user.getFullName().trim().split("\\s+");
            if (parts.length > 0) {
                name.setFamily(parts[parts.length - 1]);
                for (int i = 0; i < parts.length - 1; i++) {
                    name.addGiven(parts[i]);
                }
            }
            fhirPatient.addName(name);
        }

        if (user.getGender() != null) {
            if (user.getGender() == Gender.MALE) {
                fhirPatient.setGender(Enumerations.AdministrativeGender.MALE);
            } else if (user.getGender() == Gender.FEMALE) {
                fhirPatient.setGender(Enumerations.AdministrativeGender.FEMALE);
            } else {
                fhirPatient.setGender(Enumerations.AdministrativeGender.OTHER);
            }
        }

        if (user.getBirthday() != null) {

            Date date = Date.from(user.getBirthday().atStartOfDay(ZoneId.systemDefault()).toInstant());
            fhirPatient.setBirthDate(date);
        }

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

        if (user.getAddress() != null && !user.getAddress().isEmpty()) {
            Address address = new Address();
            address.setText(user.getAddress());
            address.setUse(Address.AddressUse.HOME);
            fhirPatient.addAddress(address);
        }

        if (patientProfile != null && patientProfile.getIdentityNumber() != null) {
            fhirPatient.addIdentifier()
                    .setSystem("urn:oid:2.16.840.1.113883.4.1")

                    .setValue(patientProfile.getIdentityNumber())
                    .setUse(org.hl7.fhir.r4.model.Identifier.IdentifierUse.OFFICIAL);
        }

        fhirPatient.setActive(user.isActive());

        return fhirPatient;
    }

    public Patient toFhirPatient(com.dapp.backend.model.FamilyMember member) {
        if (member == null) {
            return null;
        }

        Patient fhirPatient = new Patient();

        // Use DID as ID if available, else FM-ID
        if (member.getDid() != null) {
            fhirPatient.setId(member.getDid());
            fhirPatient.addIdentifier()
                    .setSystem("http://vaxsafe.com/did")
                    .setValue(member.getDid())
                    .setUse(Identifier.IdentifierUse.OFFICIAL);
        } else {
            fhirPatient.setId("FM-" + (member.getId() != null ? member.getId() : "PENDING"));
        }

        // Name
        if (member.getFullName() != null) {
            HumanName name = new HumanName();
            name.setUse(HumanName.NameUse.OFFICIAL);
            name.setText(member.getFullName());
            fhirPatient.addName(name);
        }

        // DOB
        if (member.getDateOfBirth() != null) {
            Date date = Date.from(member.getDateOfBirth().atStartOfDay(ZoneId.systemDefault()).toInstant());
            fhirPatient.setBirthDate(date);
        }

        // Gender
        if (member.getGender() != null) {
            switch (member.getGender()) {
                case MALE -> fhirPatient.setGender(Enumerations.AdministrativeGender.MALE);
                case FEMALE -> fhirPatient.setGender(Enumerations.AdministrativeGender.FEMALE);
                default -> fhirPatient.setGender(Enumerations.AdministrativeGender.OTHER);
            }
        }

        // Phone
        if (member.getPhone() != null && !member.getPhone().isEmpty()) {
            ContactPoint phone = new ContactPoint();
            phone.setSystem(ContactPoint.ContactPointSystem.PHONE);
            phone.setValue(member.getPhone());
            phone.setUse(ContactPoint.ContactPointUse.MOBILE);
            fhirPatient.addTelecom(phone);
        }

        // Identifiers
        if (member.getIdentityNumber() != null && !member.getIdentityNumber().isEmpty()) {
            fhirPatient.addIdentifier()
                    .setSystem("urn:oid:2.16.840.1.113883.4.1")
                    .setValue(member.getIdentityNumber())
                    .setUse(Identifier.IdentifierUse.OFFICIAL);
        }
        if (member.getBirthCertificateNumber() != null && !member.getBirthCertificateNumber().isEmpty()) {
            fhirPatient.addIdentifier()
                    .setSystem("http://vaxsafe.com/fhir/StructureDefinition/birth-certificate")
                    .setValue(member.getBirthCertificateNumber())
                    .setUse(Identifier.IdentifierUse.OFFICIAL);
        }

        // Relationship Extension
        if (member.getRelationship() != null && !member.getRelationship().isEmpty()) {
            Extension relExt = new Extension();
            relExt.setUrl("http://vaxsafe.com/fhir/StructureDefinition/patient-relationship");
            relExt.setValue(new StringType(member.getRelationship()));
            fhirPatient.addExtension(relExt);
        }

        // Guardian Extension
        if (member.getUser() != null) {
            Extension guardianExt = new Extension();
            guardianExt.setUrl("http://vaxsafe.com/fhir/StructureDefinition/guardian-did");
            guardianExt.setValue(new StringType(
                    member.getUser().getDid() != null ? member.getUser().getDid()
                            : String.valueOf(member.getUser().getId())));
            fhirPatient.addExtension(guardianExt);
        }

        fhirPatient.setActive(true);

        return fhirPatient;
    }
}
