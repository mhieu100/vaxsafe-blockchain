
package com.dapp.backend.dto.mapper.fhir;

import com.dapp.backend.model.VaccineRecord;
import lombok.RequiredArgsConstructor;
import org.hl7.fhir.r4.model.*;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class FhirImmunizationMapper {

    private final FhirPatientMapper fhirPatientMapper;

    public Bundle toFhirBundle(VaccineRecord record) {
        if (record == null) {
            return null;
        }

        Bundle bundle = new Bundle();
        bundle.setId(UUID.randomUUID().toString());
        bundle.setType(Bundle.BundleType.COLLECTION);
        bundle.setTimestamp(new Date());

        // 1. Create & Add Patient Resource (Snapshot)
        Patient patientResource;
        if (record.getUser() != null) {
            patientResource = fhirPatientMapper.toFhirPatient(record.getUser(), record.getUser().getPatientProfile());
        } else if (record.getFamilyMember() != null) {
            patientResource = fhirPatientMapper.toFhirPatient(record.getFamilyMember());
        } else {
            // Fallback for unknown patient (should not happen)
            patientResource = new Patient();
            patientResource.setId("Unknown");
        }

        // Ensure patient has an ID for referencing within the bundle
        if (patientResource.getIdElement().isEmpty()) {
            patientResource.setId(UUID.randomUUID().toString());
        }

        bundle.addEntry().setResource(patientResource)
                .setFullUrl("Patient/" + patientResource.getIdElement().getIdPart());
        Reference patientRef = new Reference("Patient/" + patientResource.getIdElement().getIdPart());

        // 2. Create Immunization Resource
        Immunization immunization = new Immunization();
        immunization.setId(String.valueOf(record.getId()));
        immunization.setStatus(Immunization.ImmunizationStatus.COMPLETED);
        immunization.setPatient(patientRef); // Link to the patient in this bundle

        if (record.getVaccine() != null) {
            CodeableConcept vaccineCode = new CodeableConcept();
            vaccineCode.setText(record.getVaccine().getName());
            immunization.setVaccineCode(vaccineCode);
        }

        Date occurrenceDate = null;
        if (record.getVaccinationDate() != null) {
            occurrenceDate = Date.from(record.getVaccinationDate().atStartOfDay(ZoneId.systemDefault()).toInstant());
            immunization.setOccurrence(new DateTimeType(occurrenceDate));
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

        // Add extensions for blockchain metadata
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

        // Add Immunization to Bundle
        bundle.addEntry().setResource(immunization).setFullUrl("Immunization/" + immunization.getId());

        // 3. Create Adverse Event Resource (if any)
        if (record.getAdverseReactions() != null && !record.getAdverseReactions().isEmpty()) {
            AdverseEvent adverseEvent = new AdverseEvent();
            adverseEvent.setActuality(AdverseEvent.AdverseEventActuality.ACTUAL);
            adverseEvent.setSubject(patientRef);
            if (occurrenceDate != null) {
                adverseEvent.setDate(occurrenceDate);
            }

            // Set the event detail text
            CodeableConcept eventCode = new CodeableConcept();
            eventCode.setText(record.getAdverseReactions());
            adverseEvent.setEvent(eventCode);

            // Link to the immunization as the suspect entity
            AdverseEvent.AdverseEventSuspectEntityComponent suspect = new AdverseEvent.AdverseEventSuspectEntityComponent();
            suspect.setInstance(new Reference("Immunization/" + immunization.getId()));
            adverseEvent.addSuspectEntity(suspect);

            bundle.addEntry().setResource(adverseEvent).setFullUrl("AdverseEvent/" + UUID.randomUUID());
        }

        // 4. Create Observation Resources for Vitals (Standard LOINC)

        // Weight (LOINC 29463-7)
        if (record.getWeight() != null) {
            Observation obs = createVitalObservation(patientRef, occurrenceDate, "29463-7", "Body Weight",
                    record.getWeight(), "kg");
            bundle.addEntry().setResource(obs).setFullUrl("Observation/" + UUID.randomUUID());
        }

        // Height (LOINC 8302-2)
        if (record.getHeight() != null) {
            Observation obs = createVitalObservation(patientRef, occurrenceDate, "8302-2", "Body Height",
                    record.getHeight(), "cm");
            bundle.addEntry().setResource(obs).setFullUrl("Observation/" + UUID.randomUUID());
        }

        // Temperature (LOINC 8310-5)
        if (record.getTemperature() != null) {
            Observation obs = createVitalObservation(patientRef, occurrenceDate, "8310-5", "Body Temperature",
                    record.getTemperature(), "Cel");
            bundle.addEntry().setResource(obs).setFullUrl("Observation/" + UUID.randomUUID());
        }

        // Heart Rate / Pulse (LOINC 8867-4)
        if (record.getPulse() != null) {
            Observation obs = createVitalObservation(patientRef, occurrenceDate, "8867-4", "Heart Rate",
                    (double) record.getPulse(), "/min");
            bundle.addEntry().setResource(obs).setFullUrl("Observation/" + UUID.randomUUID());
        }

        // 5. Create Provenance Resource for Digital Signatures
        Provenance provenance = new Provenance();
        provenance.setRecorded(new Date());
        provenance.addTarget(new Reference("Immunization/" + immunization.getId()));

        // Doctor Signature (Author/Verifier)
        if (record.getDoctorSignature() != null) {
            Provenance.ProvenanceAgentComponent doctorAgent = new Provenance.ProvenanceAgentComponent();
            doctorAgent.setType(new CodeableConcept().addCoding(new Coding(
                    "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                    "author",
                    "Author")));
            doctorAgent.setWho(new Reference("Practitioner/" + record.getDoctor().getId()));
            provenance.addAgent(doctorAgent);

            Signature doctorSig = new Signature();
            doctorSig.addType(new Coding("urn:iso-astm:E1762-95:2013", "1.2.840.10065.1.12.1.1", "Author's Signature"));
            doctorSig.setWhen(new Date());
            doctorSig.setWho(new Reference("Practitioner/" + record.getDoctor().getId()));
            doctorSig.setSigFormat("application/jose");
            doctorSig.setData(record.getDoctorSignature().getBytes());
            provenance.addSignature(doctorSig);
        }

        // Patient Consent Signature (Witness)
        if (record.getPatientConsentSignature() != null) {
            Provenance.ProvenanceAgentComponent patientAgent = new Provenance.ProvenanceAgentComponent();
            patientAgent.setType(new CodeableConcept().addCoding(new Coding(
                    "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                    "witness",
                    "Witness")));
            patientAgent.setWho(patientRef);
            provenance.addAgent(patientAgent);

            Signature patientSig = new Signature();
            patientSig
                    .addType(new Coding("urn:iso-astm:E1762-95:2013", "1.2.840.10065.1.12.1.14", "Consent Signature"));
            patientSig.setWhen(new Date());
            patientSig.setWho(patientRef);
            patientSig.setSigFormat("application/jose");
            patientSig.setData(record.getPatientConsentSignature().getBytes());
            provenance.addSignature(patientSig);
        }

        bundle.addEntry().setResource(provenance).setFullUrl("Provenance/" + UUID.randomUUID());

        return bundle;
    }

    private Observation createVitalObservation(Reference patientRef, Date date, String loincCode, String display,
            Double value, String unit) {
        Observation obs = new Observation();
        obs.setStatus(Observation.ObservationStatus.FINAL);
        obs.setSubject(patientRef);
        if (date != null) {
            obs.setEffective(new DateTimeType(date));
        }

        CodeableConcept code = new CodeableConcept();
        code.addCoding()
                .setSystem("http://loinc.org")
                .setCode(loincCode)
                .setDisplay(display);
        obs.setCode(code);

        Quantity quantity = new Quantity();
        quantity.setValue(value);
        quantity.setUnit(unit);
        quantity.setSystem("http://unitsofmeasure.org");
        quantity.setCode(unit);
        obs.setValue(quantity);

        return obs;
    }
}
