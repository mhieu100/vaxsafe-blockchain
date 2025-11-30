package com.dapp.backend.service;

import com.dapp.backend.dto.response.DoctorAvailableSlotResponse;
import com.dapp.backend.dto.response.DoctorResponse;
import com.dapp.backend.dto.response.DoctorScheduleResponse;
import com.dapp.backend.dto.response.DoctorWithScheduleResponse;
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
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DoctorScheduleService {
    
    DoctorRepository doctorRepository;
    DoctorScheduleRepository doctorScheduleRepository;
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
     * Get all available doctors with today's schedule by center
     * This is used for doctor-schedule page in frontend
     */
    public List<DoctorWithScheduleResponse> getDoctorsWithTodaySchedule(Long centerId, LocalDate date) {
        List<Doctor> doctors = doctorRepository.findByCenter_CenterIdAndIsAvailableTrue(centerId);
        
        return doctors.stream()
            .map(doctor -> toDoctorWithScheduleResponse(doctor, date))
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
     * Get all available slots for a center on a specific date and time slot
     * This filters slots to only those within the given TimeSlotEnum range
     */
    public List<DoctorAvailableSlotResponse> getAvailableSlotsByCenterAndTimeSlot(
            Long centerId, LocalDate date, com.dapp.backend.enums.TimeSlotEnum timeSlot) {
        // Get time range from TimeSlotEnum
        LocalTime startTime = getTimeSlotStartTime(timeSlot);
        LocalTime endTime = getTimeSlotEndTime(timeSlot);
        
        log.info("Fetching available slots for center {}, date {}, timeSlot {} ({} - {})", 
            centerId, date, timeSlot, startTime, endTime);
        
        List<DoctorAvailableSlot> slots = slotRepository.findAvailableSlotsByCenterAndTimeRange(
                centerId, date, startTime, endTime);
        
        log.info("Found {} available slots", slots.size());
        
        return slots.stream()
            .map(this::toSlotResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Helper method to get start time from TimeSlotEnum
     */
    private LocalTime getTimeSlotStartTime(com.dapp.backend.enums.TimeSlotEnum timeSlot) {
        return switch (timeSlot) {
            case SLOT_07_00 -> LocalTime.of(7, 0);
            case SLOT_09_00 -> LocalTime.of(9, 0);
            case SLOT_11_00 -> LocalTime.of(11, 0);
            case SLOT_13_00 -> LocalTime.of(13, 0);
            case SLOT_15_00 -> LocalTime.of(15, 0);
        };
    }
    
    /**
     * Helper method to get end time from TimeSlotEnum (2 hours after start)
     */
    private LocalTime getTimeSlotEndTime(com.dapp.backend.enums.TimeSlotEnum timeSlot) {
        return getTimeSlotStartTime(timeSlot).plusHours(2);
    }
    
    /**
     * Generate slots for a doctor within a date range
     * Default working hours: 7:00 - 17:00, every day, 30-minute slots
     * If DoctorSchedule exists, use it. Otherwise use default hours.
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
            // Get day of week (Monday=1, Sunday=7 in Java, but we store 0-6)
            int dayOfWeek = currentDate.getDayOfWeek().getValue() % 7; // Convert to 0=Sunday
            
            // Try to get doctor's custom schedule
            var schedules = doctorScheduleRepository
                .findActiveDaySchedules(doctorId, dayOfWeek);
            
            if (schedules.isEmpty()) {
                // No custom schedule found, use default: 7:00 - 17:00
                log.debug("No custom schedule for doctor {} on day {}, using default 7:00-17:00", 
                    doctorId, dayOfWeek);
                slotsGenerated += generateSlotsForTimeRange(
                    doctor,
                    currentDate,
                    LocalTime.of(7, 0),  // Start at 7:00
                    LocalTime.of(17, 0)  // End at 17:00
                );
            } else {
                // Use custom schedule
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
     * Default slot duration: 30 minutes
     */
    private int generateSlotsForTimeRange(Doctor doctor, LocalDate date, 
                                           LocalTime startTime, LocalTime endTime) {
        int slotsGenerated = 0;
        // Use doctor's consultation duration, default to 30 minutes if not set
        Integer duration = doctor.getConsultationDuration() != null 
            ? doctor.getConsultationDuration() 
            : 30;
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
    
    private DoctorWithScheduleResponse toDoctorWithScheduleResponse(Doctor doctor, LocalDate date) {
        // Get all slots for the doctor on the given date
        List<DoctorAvailableSlot> slots = slotRepository.findDoctorSlotsInRange(
            doctor.getDoctorId(), date, date);
        
        // Calculate statistics
        int totalSlots = slots.size();
        int availableSlots = (int) slots.stream()
            .filter(s -> s.getStatus() == SlotStatus.AVAILABLE)
            .count();
        int bookedSlots = (int) slots.stream()
            .filter(s -> s.getStatus() == SlotStatus.BOOKED)
            .count();
        int blockedSlots = (int) slots.stream()
            .filter(s -> s.getStatus() == SlotStatus.BLOCKED)
            .count();
        
        // Convert slots to responses
        List<DoctorAvailableSlotResponse> slotResponses = slots.stream()
            .map(this::toSlotResponse)
            .collect(Collectors.toList());
        
        // Get working hours for today
        String workingHours = getWorkingHoursForDate(doctor, date);
        
        return DoctorWithScheduleResponse.builder()
            .doctorId(doctor.getDoctorId())
            .userId(doctor.getUser().getId())
            .doctorName(doctor.getUser().getFullName())
            .email(doctor.getUser().getEmail())
            .avatar(doctor.getUser().getAvatar())
            .phone(doctor.getUser().getEmail()) // Assuming phone is not stored separately
            .licenseNumber(doctor.getLicenseNumber())
            .specialization(doctor.getSpecialization())
            .consultationDuration(doctor.getConsultationDuration())
            .maxPatientsPerDay(doctor.getMaxPatientsPerDay())
            .isAvailable(doctor.getIsAvailable())
            .centerId(doctor.getCenter().getCenterId())
            .centerName(doctor.getCenter().getName())
            .totalSlotsToday(totalSlots)
            .availableSlotsToday(availableSlots)
            .bookedSlotsToday(bookedSlots)
            .blockedSlotsToday(blockedSlots)
            .todaySchedule(slotResponses)
            .workingHoursToday(workingHours)
            .build();
    }
    
    private String getWorkingHoursForDate(Doctor doctor, LocalDate date) {
        // Get day of week (0=Sunday, 1=Monday, etc.)
        int dayOfWeek = date.getDayOfWeek().getValue() % 7;
        
        // Get all schedules for this day
        var schedules = doctorScheduleRepository
            .findActiveDaySchedules(doctor.getDoctorId(), dayOfWeek);
        
        if (schedules.isEmpty()) {
            return "Không có lịch làm việc";
        }
        
        // Find earliest start and latest end time
        LocalTime earliestStart = schedules.stream()
            .map(DoctorSchedule::getStartTime)
            .min(LocalTime::compareTo)
            .orElse(null);
        
        LocalTime latestEnd = schedules.stream()
            .map(DoctorSchedule::getEndTime)
            .max(LocalTime::compareTo)
            .orElse(null);
        
        if (earliestStart != null && latestEnd != null) {
            return formatTimeRange(earliestStart, latestEnd);
        }
        
        return "Không có lịch làm việc";
    }
    
    private String formatTimeRange(LocalTime start, LocalTime end) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        return start.format(formatter) + " - " + end.format(formatter);
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
