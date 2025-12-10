package com.dapp.backend.service;

import com.dapp.backend.dto.request.UpdateProfileRequest;
import com.dapp.backend.dto.response.ProfileResponse;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.*;
import com.dapp.backend.repository.PatientRepository;
import com.dapp.backend.repository.UserRepository;
import com.dapp.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    private User getCurrentUser() throws AppException {
        String email = JwtUtil.getCurrentEmailLogin()
                .orElseThrow(() -> new AppException("User not authenticated"));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found"));
    }

    public ProfileResponse.PatientProfile getPatientProfile() throws AppException {
        User user = getCurrentUser();

        if (user.getPatientProfile() == null) {
            throw new AppException("Patient profile not found");
        }

        Patient patient = user.getPatientProfile();

        return ProfileResponse.PatientProfile.builder()
                .id(user.getId())
                .avatar(user.getAvatar())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .birthday(user.getBirthday())
                .address(user.getAddress())
                .role(user.getRole().getName())
                .patientId(patient.getId())
                .identityNumber(patient.getIdentityNumber())
                .bloodType(patient.getBloodType())
                .heightCm(patient.getHeightCm())
                .weightKg(patient.getWeightKg())
                .occupation(patient.getOccupation())
                .lifestyleNotes(patient.getLifestyleNotes())
                .insuranceNumber(patient.getInsuranceNumber())
                .consentForAIAnalysis(patient.isConsentForAIAnalysis())
                .build();
    }

    @Transactional
    public ProfileResponse.PatientProfile updatePatientProfile(UpdateProfileRequest.PatientProfileUpdate request)
            throws AppException {
        User user = getCurrentUser();

        log.info("Updating patient profile for user: {}", user.getEmail());
        log.debug("Update request data: {}", request);

        if (user.getPatientProfile() == null) {
            throw new AppException("Patient profile not found");
        }

        Patient patient = user.getPatientProfile();

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null)
            user.setPhone(request.getPhone());
        if (request.getGender() != null)
            user.setGender(request.getGender());
        if (request.getAddress() != null)
            user.setAddress(request.getAddress());

        if (request.getBloodType() != null)
            patient.setBloodType(request.getBloodType());
        if (request.getHeightCm() != null)
            patient.setHeightCm(request.getHeightCm());
        if (request.getWeightKg() != null)
            patient.setWeightKg(request.getWeightKg());
        if (request.getOccupation() != null)
            patient.setOccupation(request.getOccupation());
        if (request.getLifestyleNotes() != null)
            patient.setLifestyleNotes(request.getLifestyleNotes());
        if (request.getInsuranceNumber() != null)
            patient.setInsuranceNumber(request.getInsuranceNumber());
        if (request.getConsentForAIAnalysis() != null)
            patient.setConsentForAIAnalysis(request.getConsentForAIAnalysis());

        Patient savedPatient = patientRepository.save(patient);
        log.debug("Patient saved: {}", savedPatient.getId());

        User savedUser = userRepository.save(user);
        log.info("User profile updated successfully for: {}", savedUser.getEmail());

        return getPatientProfile();
    }

    public ProfileResponse.DoctorProfile getDoctorProfile() throws AppException {
        User user = getCurrentUser();

        if (user.getDoctor() == null) {
            throw new AppException("Doctor profile not found");
        }

        Doctor doctor = user.getDoctor();
        Center center = doctor.getCenter();

        return ProfileResponse.DoctorProfile.builder()
                .id(user.getId())
                .avatar(user.getAvatar())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .birthday(user.getBirthday())
                .address(user.getAddress())
                .role(user.getRole().getName())
                .doctorId(doctor.getDoctorId())
                .licenseNumber(doctor.getLicenseNumber())
                .specialization(doctor.getSpecialization())
                .consultationDuration(doctor.getConsultationDuration())
                .maxPatientsPerDay(doctor.getMaxPatientsPerDay())
                .isAvailable(doctor.getIsAvailable())
                .centerId(center != null ? center.getCenterId() : null)
                .centerName(center != null ? center.getName() : null)
                .centerAddress(center != null ? center.getAddress() : null)
                .build();
    }

    @Transactional
    public ProfileResponse.DoctorProfile updateDoctorProfile(UpdateProfileRequest.DoctorProfileUpdate request)
            throws AppException {
        User user = getCurrentUser();

        if (user.getDoctor() == null) {
            throw new AppException("Doctor profile not found");
        }

        Doctor doctor = user.getDoctor();

        user.setFullName(request.getFullName());
        if (request.getPhone() != null)
            user.setPhone(request.getPhone());
        if (request.getGender() != null)
            user.setGender(request.getGender());

        if (request.getAddress() != null)
            user.setAddress(request.getAddress());

        if (request.getSpecialization() != null)
            doctor.setSpecialization(request.getSpecialization());
        if (request.getConsultationDuration() != null)
            doctor.setConsultationDuration(request.getConsultationDuration());
        if (request.getMaxPatientsPerDay() != null)
            doctor.setMaxPatientsPerDay(request.getMaxPatientsPerDay());

        userRepository.save(user);

        return getDoctorProfile();
    }

    public ProfileResponse.CashierProfile getCashierProfile() throws AppException {
        User user = getCurrentUser();

        if (user.getCashier() == null) {
            throw new AppException("Cashier profile not found");
        }

        Cashier cashier = user.getCashier();
        Center center = cashier.getCenter();

        return ProfileResponse.CashierProfile.builder()
                .id(user.getId())
                .avatar(user.getAvatar())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .birthday(user.getBirthday())
                .address(user.getAddress())
                .role(user.getRole().getName())
                .cashierId(cashier.getCashierId())
                .employeeCode(cashier.getEmployeeCode())
                .shiftStartTime(cashier.getShiftStartTime())
                .shiftEndTime(cashier.getShiftEndTime())
                .isActive(cashier.getIsActive())
                .centerId(center != null ? center.getCenterId() : null)
                .centerName(center != null ? center.getName() : null)
                .centerAddress(center != null ? center.getAddress() : null)
                .build();
    }

    @Transactional
    public ProfileResponse.CashierProfile updateCashierProfile(UpdateProfileRequest.CashierProfileUpdate request)
            throws AppException {
        User user = getCurrentUser();

        if (user.getCashier() == null) {
            throw new AppException("Cashier profile not found");
        }

        Cashier cashier = user.getCashier();

        user.setFullName(request.getFullName());
        if (request.getPhone() != null)
            user.setPhone(request.getPhone());
        if (request.getGender() != null)
            user.setGender(request.getGender());

        if (request.getAddress() != null)
            user.setAddress(request.getAddress());

        if (request.getShiftStartTime() != null)
            cashier.setShiftStartTime(request.getShiftStartTime());
        if (request.getShiftEndTime() != null)
            cashier.setShiftEndTime(request.getShiftEndTime());

        userRepository.save(user);

        return getCashierProfile();
    }

    public ProfileResponse.AdminProfile getAdminProfile() throws AppException {
        User user = getCurrentUser();

        return ProfileResponse.AdminProfile.builder()
                .id(user.getId())
                .avatar(user.getAvatar())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .birthday(user.getBirthday())
                .address(user.getAddress())
                .role(user.getRole().getName())
                .build();
    }

    @Transactional
    public ProfileResponse.AdminProfile updateAdminProfile(UpdateProfileRequest.AdminProfileUpdate request)
            throws AppException {
        User user = getCurrentUser();

        user.setFullName(request.getFullName());
        if (request.getPhone() != null)
            user.setPhone(request.getPhone());
        if (request.getGender() != null)
            user.setGender(request.getGender());

        if (request.getAddress() != null)
            user.setAddress(request.getAddress());

        userRepository.save(user);

        return getAdminProfile();
    }

    @Transactional
    public String updateAvatar(String avatarUrl) throws AppException {
        User user = getCurrentUser();
        user.setAvatar(avatarUrl);
        userRepository.save(user);
        return user.getAvatar();
    }

    @Transactional
    public void completeTour() throws AppException {
        User user = getCurrentUser();
        user.setNewUser(false);
        userRepository.save(user);
    }
}
