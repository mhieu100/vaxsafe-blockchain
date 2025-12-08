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


        fhirPatient.setId(String.valueOf(user.getId()));


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
}
