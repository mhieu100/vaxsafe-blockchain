package com.dapp.backend.dto.mapper.fhir;

import com.dapp.backend.model.VaccineRecord;
import org.hl7.fhir.r4.model.*;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.util.Date;

@Component
public class FhirImmunizationMapper {

    
    public Immunization toFhirImmunization(VaccineRecord record) {
        if (record == null) {
            return null;
        }

        Immunization immunization = new Immunization();


        immunization.setId(String.valueOf(record.getId()));


        immunization.setStatus(Immunization.ImmunizationStatus.COMPLETED);


        if (record.getVaccine() != null) {
            CodeableConcept vaccineCode = new CodeableConcept();
            vaccineCode.setText(record.getVaccine().getName());
          
            immunization.setVaccineCode(vaccineCode);
        }

        if (record.getUser() != null) {
            immunization.setPatient(new Reference("Patient/" + record.getUser().getId()));
        } else if (record.getFamilyMember() != null) {
            immunization.setPatient(new Reference("Patient/FM-" + record.getFamilyMember().getId()));
        }

        if (record.getVaccinationDate() != null) {
            Date date = Date.from(record.getVaccinationDate().atStartOfDay(ZoneId.systemDefault()).toInstant());
            immunization.setOccurrence(new DateTimeType(date));
        }

        

        if (record.getExpiryDate() != null) {
            Date date = Date.from(record.getExpiryDate().atStartOfDay(ZoneId.systemDefault()).toInstant());
            immunization.setExpirationDate(date);
        }

        if (record.getSite() != null) {
            CodeableConcept site = new CodeableConcept();
            site.setText(record.getSite().name());

            immunization.setSite(site);
        }


        if (record.getDoctor() != null) {
            Immunization.ImmunizationPerformerComponent performer = new Immunization.ImmunizationPerformerComponent();
            performer.setActor(new Reference("Practitioner/" + record.getDoctor().getId()));
            performer.setFunction(new CodeableConcept().setText("Administering Provider"));
            immunization.addPerformer(performer);
        }


        if (record.getCenter() != null) {
            immunization.setLocation(new Reference("Location/" + record.getCenter().getCenterId())
                    .setDisplay(record.getCenter().getName()));
        }


        if (record.getDoseNumber() != null) {
            Immunization.ImmunizationProtocolAppliedComponent protocol = new Immunization.ImmunizationProtocolAppliedComponent();
            protocol.setDoseNumber(new PositiveIntType(record.getDoseNumber()));
            if (record.getVaccine() != null) {
                protocol.setSeriesDoses(new PositiveIntType(record.getVaccine().getDosesRequired()));
            }
            immunization.addProtocolApplied(protocol);
        }


        if (record.getNotes() != null) {
            immunization.addNote(new Annotation().setText(record.getNotes()));
        }


        if (record.getTransactionHash() != null) {
            Extension ext = new Extension();
            ext.setUrl("http://vaxsafe.com/fhir/StructureDefinition/blockchain-transaction-hash");
            ext.setValue(new StringType(record.getTransactionHash()));
            immunization.addExtension(ext);
        }


        if (record.getIpfsHash() != null) {
            Extension ext = new Extension();
            ext.setUrl("http://vaxsafe.com/fhir/StructureDefinition/ipfs-hash");
            ext.setValue(new StringType(record.getIpfsHash()));
            immunization.addExtension(ext);
        }


        if (record.getHeight() != null) {
            immunization.addExtension(new Extension("http://vaxsafe.com/fhir/StructureDefinition/vital-height",
                    new DecimalType(record.getHeight())));
        }
        if (record.getWeight() != null) {
            immunization.addExtension(new Extension("http://vaxsafe.com/fhir/StructureDefinition/vital-weight",
                    new DecimalType(record.getWeight())));
        }
        if (record.getTemperature() != null) {
            immunization.addExtension(new Extension("http://vaxsafe.com/fhir/StructureDefinition/vital-temperature",
                    new DecimalType(record.getTemperature())));
        }
        if (record.getPulse() != null) {
            immunization.addExtension(new Extension("http://vaxsafe.com/fhir/StructureDefinition/vital-pulse",
                    new IntegerType(record.getPulse())));
        }
        if (record.getAdverseReactions() != null) {
            immunization.addExtension(new Extension("http://vaxsafe.com/fhir/StructureDefinition/adverse-reactions",
                    new StringType(record.getAdverseReactions())));
        }

        return immunization;
    }
}
