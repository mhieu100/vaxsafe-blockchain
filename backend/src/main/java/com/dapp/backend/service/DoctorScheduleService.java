package com.dapp.backend.service;

import com.dapp.backend.dto.response.DoctorAvailableSlotResponse;
import com.dapp.backend.dto.response.DoctorResponse;
import com.dapp.backend.dto.response.DoctorScheduleResponse;
import com.dapp.backend.enums.SlotStatus;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.*;
import com.dapp.backend.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DoctorScheduleService {
    
    DoctorRepository doctorRepository;
    DoctorScheduleRepository doctorScheduleRepository;
    DoctorSpecialScheduleRepository specialScheduleRepository;
    DoctorLeaveRepository leaveRepository;
    DoctorAvailableSlotRepository slotRepository;
    
    /**
     * Get all available doctors by center
     */
    public List<DoctorResponse> getAvailableDoctorsByCenter(Long centerId) {
        return doctorRepository.findByCenter_CenterIdAndIsAvailableTrue(centerId)
            .stream()
            .map(this::toDoctorResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get doctor schedules (weekly template)
     */
    public List<DoctorScheduleResponse> getDoctorSchedules(Long doctorId) {
        return doctorScheduleRepository.findByDoctor_DoctorIdAndIsActiveTrue(doctorId)
            .stream()
            .map(this::toScheduleResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get available slots for a doctor on a specific date
     */
    public List<DoctorAvailableSlotResponse> getAvailableSlots(Long doctorId, LocalDate date) {
        return slotRepository.findAvailableSlots(doctorId, date)
            .stream()
            .map(this::toSlotResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get all available slots for a center on a specific date
     */
    public List<DoctorAvailableSlotResponse> getAvailableSlotsByCenter(Long centerId, LocalDate date) {
        return slotRepository.findAvailableSlotsByCenter(centerId, date)
            .stream()
            .map(this::toSlotResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Generate slots for a doctor within a date range
     * This implements the logic from stored procedure
     */
    @Transactional
    public int generateDoctorSlots(Long doctorId, LocalDate startDate, LocalDate endDate) throws AppException {
        Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() -> new AppException("Doctor not found with id: " + doctorId));
        
        if (!doctor.getIsAvailable()) {
            throw new AppException("Doctor is not available");
        }
        
        int slotsGenerated = 0;
        LocalDate currentDate = startDate;
        
        while (!currentDate.isAfter(endDate)) {
            // Check if doctor is on leave
            if (leaveRepository.isDoctorOnLeave(doctorId, currentDate)) {
                currentDate = currentDate.plusDays(1);
                continue;
            }
            
            // Get day of week (Monday=1, Sunday=7 in Java, but we store 0-6)
            int dayOfWeek = currentDate.getDayOfWeek().getValue() % 7; // Convert to 0=Sunday
            
            // Check for special schedule first
            var specialSchedule = specialScheduleRepository
                .findByDoctor_DoctorIdAndWorkDate(doctorId, currentDate);
            
            if (specialSchedule.isPresent()) {
                // Use special schedule
                slotsGenerated += generateSlotsForTimeRange(
                    doctor, 
                    currentDate, 
                    specialSchedule.get().getStartTime(),
                    specialSchedule.get().getEndTime()
                );
            } else {
                // Use normal weekly schedule
                var schedules = doctorScheduleRepository
                    .findActiveDaySchedules(doctorId, dayOfWeek);
                
                for (DoctorSchedule schedule : schedules) {
                    slotsGenerated += generateSlotsForTimeRange(
                        doctor,
                        currentDate,
                        schedule.getStartTime(),
                        schedule.getEndTime()
                    );
                }
            }
            
            currentDate = currentDate.plusDays(1);
        }
        
        log.info("Generated {} slots for doctor {} from {} to {}", 
            slotsGenerated, doctorId, startDate, endDate);
        
        return slotsGenerated;
    }
    
    /**
     * Helper method to generate slots for a time range
     */
    private int generateSlotsForTimeRange(Doctor doctor, LocalDate date, 
                                           LocalTime startTime, LocalTime endTime) {
        int slotsGenerated = 0;
        Integer duration = doctor.getConsultationDuration();
        LocalTime slotStart = startTime;
        
        while (slotStart.isBefore(endTime)) {
            LocalTime slotEnd = slotStart.plusMinutes(duration);
            
            if (!slotEnd.isAfter(endTime)) {
                // Check if slot already exists
                var existing = slotRepository.findByDoctor_DoctorIdAndSlotDateAndStartTime(
                    doctor.getDoctorId(), date, slotStart
                );
                
                if (existing.isEmpty()) {
                    DoctorAvailableSlot slot = DoctorAvailableSlot.builder()
                        .doctor(doctor)
                        .slotDate(date)
                        .startTime(slotStart)
                        .endTime(slotEnd)
                        .status(SlotStatus.AVAILABLE)
                        .build();
                    
                    slotRepository.save(slot);
                    slotsGenerated++;
                }
            }
            
            slotStart = slotEnd;
        }
        
        return slotsGenerated;
    }
    
    /**
     * Get doctor's slots in a date range (for viewing schedule)
     */
    public List<DoctorAvailableSlotResponse> getDoctorSlotsInRange(
            Long doctorId, LocalDate startDate, LocalDate endDate) {
        return slotRepository.findDoctorSlotsInRange(doctorId, startDate, endDate)
            .stream()
            .map(this::toSlotResponse)
            .collect(Collectors.toList());
    }
    
    // Mapper methods
    private DoctorResponse toDoctorResponse(Doctor doctor) {
        return DoctorResponse.builder()
            .doctorId(doctor.getDoctorId())
            .userId(doctor.getUser().getId())
            .doctorName(doctor.getUser().getFullName())
            .email(doctor.getUser().getEmail())
            .avatar(doctor.getUser().getAvatar())
            .licenseNumber(doctor.getLicenseNumber())
            .specialization(doctor.getSpecialization())
            .consultationDuration(doctor.getConsultationDuration())
            .maxPatientsPerDay(doctor.getMaxPatientsPerDay())
            .isAvailable(doctor.getIsAvailable())
            .centerId(doctor.getCenter().getCenterId())
            .centerName(doctor.getCenter().getName())
            .build();
    }
    
    private DoctorScheduleResponse toScheduleResponse(DoctorSchedule schedule) {
        String[] dayNames = {"Sunday", "Monday", "Tuesday", "Wednesday", 
                             "Thursday", "Friday", "Saturday"};
        
        return DoctorScheduleResponse.builder()
            .scheduleId(schedule.getScheduleId())
            .doctorId(schedule.getDoctor().getDoctorId())
            .dayOfWeek(schedule.getDayOfWeek())
            .dayName(dayNames[schedule.getDayOfWeek()])
            .startTime(schedule.getStartTime())
            .endTime(schedule.getEndTime())
            .isActive(schedule.getIsActive())
            .build();
    }
    
    private DoctorAvailableSlotResponse toSlotResponse(DoctorAvailableSlot slot) {
        return DoctorAvailableSlotResponse.builder()
            .slotId(slot.getSlotId())
            .doctorId(slot.getDoctor().getDoctorId())
            .doctorName(slot.getDoctor().getUser().getFullName())
            .slotDate(slot.getSlotDate())
            .startTime(slot.getStartTime())
            .endTime(slot.getEndTime())
            .status(slot.getStatus())
            .appointmentId(slot.getAppointment() != null ? slot.getAppointment().getId() : null)
            .notes(slot.getNotes())
            .build();
    }
}
