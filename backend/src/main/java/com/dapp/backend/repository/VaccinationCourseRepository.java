package com.dapp.backend.repository;

import com.dapp.backend.enums.VaccinationCourseStatus;
import com.dapp.backend.model.FamilyMember;
import com.dapp.backend.model.User;
import com.dapp.backend.model.VaccinationCourse;
import com.dapp.backend.model.Vaccine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VaccinationCourseRepository extends JpaRepository<VaccinationCourse, Long> {
        Optional<VaccinationCourse> findByPatientAndFamilyMemberIsNullAndVaccineAndStatus(User patient, Vaccine vaccine,
                        VaccinationCourseStatus status);

        Optional<VaccinationCourse> findByFamilyMemberAndVaccineAndStatus(FamilyMember familyMember, Vaccine vaccine,
                        VaccinationCourseStatus status);

        java.util.List<VaccinationCourse> findByPatientAndFamilyMemberIsNull(User patient);

        java.util.List<VaccinationCourse> findByFamilyMember(FamilyMember familyMember);
}
