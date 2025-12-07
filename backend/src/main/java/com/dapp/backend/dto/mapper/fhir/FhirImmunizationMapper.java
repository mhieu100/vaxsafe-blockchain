package com.dapp.backend.dto.mapper.fhir;

import com.dapp.backend.model.VaccineRecord;
import org.hl7.fhir.r4.model.*;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.util.Date;

@Component
public class FhirImmunizationMapper {

    /**
     * Maps the internal VaccineRecord entity to a FHIR Immunization resource.
     *
     * @param record The internal VaccineRecord entity.
     * @return A FHIR R4 Immunization resource.
     */
    public Immunization toFhirImmunization(VaccineRecord record) {
        if (record == null) {
            return null;
        }

        Immunization immunization = new Immunization();

        // 1. ID
        immunization.setId(String.valueOf(record.getId()));

        // 2. Status
        // Assuming all records in this table are completed vaccinations
        immunization.setStatus(Immunization.ImmunizationStatus.COMPLETED);

        // 3. Vaccine Code
        if (record.getVaccine() != null) {
            CodeableConcept vaccineCode = new CodeableConcept();
            vaccineCode.setText(record.getVaccine().getName());
            // In a real system, you would map this to a standard system like CVX
            // vaccineCode.addCoding().setSystem("http://hl7.org/fhir/sid/cvx").setCode("...");
            immunization.setVaccineCode(vaccineCode);
        }

        // 4. Patient Reference
        if (record.getUser() != null) {
            immunization.setPatient(new Reference("Patient/" + record.getUser().getId()));
        } else if (record.getFamilyMember() != null) {
            // Assuming FamilyMember is also mapped to Patient resource with a prefix or
            // separate ID space
            immunization.setPatient(new Reference("Patient/FM-" + record.getFamilyMember().getId()));
        }

        // 5. Occurrence Date
        if (record.getVaccinationDate() != null) {
            Date date = Date.from(record.getVaccinationDate().atStartOfDay(ZoneId.systemDefault()).toInstant());
            immunization.setOccurrence(new DateTimeType(date));
        }

        // 6. Lot Number
        if (record.getLotNumber() != null) {
            immunization.setLotNumber(record.getLotNumber());
        }

        // 7. Expiration Date
        if (record.getExpiryDate() != null) {
            Date date = Date.from(record.getExpiryDate().atStartOfDay(ZoneId.systemDefault()).toInstant());
            immunization.setExpirationDate(date);
        }

        // 8. Site (Body Site)
        if (record.getSite() != null) {
            CodeableConcept site = new CodeableConcept();
            site.setText(record.getSite().name());
            // Standard coding can be added here (e.g., SNOMED CT)
            immunization.setSite(site);
        }

        // 9. Performer (Doctor)
        if (record.getDoctor() != null) {
            Immunization.ImmunizationPerformerComponent performer = new Immunization.ImmunizationPerformerComponent();
            performer.setActor(new Reference("Practitioner/" + record.getDoctor().getId()));
            performer.setFunction(new CodeableConcept().setText("Administering Provider"));
            immunization.addPerformer(performer);
        }

        // 10. Location (Center)
        if (record.getCenter() != null) {
            immunization.setLocation(new Reference("Location/" + record.getCenter().getCenterId())
                    .setDisplay(record.getCenter().getName()));
        }

        // 11. Protocol Applied (Dose Number)
        if (record.getDoseNumber() != null) {
            Immunization.ImmunizationProtocolAppliedComponent protocol = new Immunization.ImmunizationProtocolAppliedComponent();
            protocol.setDoseNumber(new PositiveIntType(record.getDoseNumber()));
            if (record.getVaccine() != null) {
                protocol.setSeriesDoses(new PositiveIntType(record.getVaccine().getDosesRequired()));
            }
            immunization.addProtocolApplied(protocol);
        }

        // 12. Notes
        if (record.getNotes() != null) {
            immunization.addNote(new Annotation().setText(record.getNotes()));
        }

        // =================================================================================
        // BLOCKCHAIN EXTENSIONS (The "Wow" Factor)
        // =================================================================================

        // Extension for Blockchain Transaction Hash
        if (record.getTransactionHash() != null) {
            Extension ext = new Extension();
            ext.setUrl("http://vaxsafe.com/fhir/StructureDefinition/blockchain-transaction-hash");
            ext.setValue(new StringType(record.getTransactionHash()));
            immunization.addExtension(ext);
        }

        // Extension for IPFS Hash
        if (record.getIpfsHash() != null) {
            Extension ext = new Extension();
            ext.setUrl("http://vaxsafe.com/fhir/StructureDefinition/ipfs-hash");
            ext.setValue(new StringType(record.getIpfsHash()));
            immunization.addExtension(ext);
        }

        return immunization;
    }
}
