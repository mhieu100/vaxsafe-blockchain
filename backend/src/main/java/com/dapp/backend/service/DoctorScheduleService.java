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
    /**
     * Get available slots for a doctor on a specific date (Virtual + Physical)
     */
    /**
     * Get available slots for a doctor on a specific date (Virtual + Physical)
     */
    public List<DoctorAvailableSlotResponse> getAvailableSlots(Long doctorId, LocalDate date) {
        try {
            return getDoctorSlotsInRange(doctorId, date, date).stream()
                    .filter(slot -> slot.getStatus() == SlotStatus.AVAILABLE)
                    .collect(Collectors.toList());
        } catch (AppException e) {
            log.error("Error getting slots for doctor {}: {}", doctorId, e.getMessage());
            return List.of();
        }
    }

    /**
     * Get all available slots for a center on a specific date (OPTIMIZED)
     * Sử dụng batch query để tránh N+1 problem
     * 
     * @param centerId ID của trung tâm
     * @param date Ngày cần lấy slots
     * @return List các slots AVAILABLE của tất cả doctors trong center
     */
    public List<DoctorAvailableSlotResponse> getAvailableSlotsByCenter(Long centerId, LocalDate date) {
        // 1. Get all available doctors in center
        List<Doctor> doctors = doctorRepository.findByCenter_CenterIdAndIsAvailableTrue(centerId);
        
        if (doctors.isEmpty()) {
            log.warn("No available doctors found for center {}", centerId);
            return List.of();
        }

        // 2. Extract doctor IDs
        List<Long> doctorIds = doctors.stream()
                .map(Doctor::getDoctorId)
                .collect(Collectors.toList());

        // 3. Batch query - lấy tất cả real slots của tất cả doctors trong 1 query
        List<DoctorAvailableSlot> existingSlots = 
            slotRepository.findSlotsByDoctorIdsAndDateRange(doctorIds, date, date);
        
        log.debug("Batch query found {} real slots for {} doctors in center {}", 
            existingSlots.size(), doctors.size(), centerId);

        // 4. Group existing slots by doctorId để lookup nhanh
        java.util.Map<Long, List<DoctorAvailableSlot>> slotsByDoctor = existingSlots.stream()
                .collect(Collectors.groupingBy(s -> s.getDoctor().getDoctorId()));

        // 5. Generate virtual slots cho từng doctor và merge với real slots
        return doctors.stream()
                .flatMap(doctor -> {
                    // Get real slots của doctor này
                    List<DoctorAvailableSlot> doctorRealSlots = 
                        slotsByDoctor.getOrDefault(doctor.getDoctorId(), List.of());
                    
                    // Generate virtual slots (sử dụng helper method mới)
                    return generateSlotsForDate(doctor, date, doctorRealSlots).stream();
                })
                .filter(slot -> slot.getStatus() == SlotStatus.AVAILABLE)
                .sorted(java.util.Comparator
                        .comparing(DoctorAvailableSlotResponse::getStartTime)
                        .thenComparing(DoctorAvailableSlotResponse::getDoctorId))
                .collect(Collectors.toList());
    }

    /**
     * Helper method: Generate slots cho 1 ngày của 1 doctor
     * Tách riêng để reuse và dễ test
     */
    private List<DoctorAvailableSlotResponse> generateSlotsForDate(
            Doctor doctor, LocalDate date, List<DoctorAvailableSlot> existingSlots) {
        
        // Build map từ existing slots
        java.util.Map<String, DoctorAvailableSlot> slotMap = existingSlots.stream()
                .collect(Collectors.toMap(
                        s -> s.getSlotDate().toString() + "_" + s.getStartTime().toString(),
                        s -> s,
                        (existing, replacement) -> existing));

        List<DoctorAvailableSlotResponse> slots = new java.util.ArrayList<>();
        
        // Get schedule cho ngày này
        int dayOfWeek = date.getDayOfWeek().getValue() % 7;
        List<DoctorSchedule> schedules = doctorScheduleRepository
                .findActiveDaySchedules(doctor.getDoctorId(), dayOfWeek);

        // Default schedule nếu không có
        if (schedules.isEmpty()) {
            schedules = List.of(DoctorSchedule.builder()
                    .startTime(LocalTime.of(7, 0))
                    .endTime(LocalTime.of(17, 0))
                    .build());
        }

        int duration = doctor.getConsultationDuration() != null 
            ? doctor.getConsultationDuration() : 30;

        // Generate slots cho từng shift
        for (DoctorSchedule sched : schedules) {
            LocalTime time = sched.getStartTime();

            while (time.isBefore(sched.getEndTime())) {
                LocalTime endTime = time.plusMinutes(duration);
                if (endTime.isAfter(sched.getEndTime())) break;

                String key = date.toString() + "_" + time.toString();

                if (slotMap.containsKey(key)) {
                    slots.add(toSlotResponse(slotMap.get(key)));
                } else {
                    slots.add(DoctorAvailableSlotResponse.builder()
                            .doctorId(doctor.getDoctorId())
                            .doctorName(doctor.getUser().getFullName())
                            .slotDate(date)
                            .startTime(time)
                            .endTime(endTime)
                            .status(SlotStatus.AVAILABLE)
                            .build());
                }
                time = endTime;
            }
        }

        return slots;
    }

    /**
     * Get all available slots for a center on a specific date and time slot
     * This filters slots to only those within the given TimeSlotEnum range
     */
    public List<DoctorAvailableSlotResponse> getAvailableSlotsByCenterAndTimeSlot(
            Long centerId, LocalDate date, com.dapp.backend.enums.TimeSlotEnum timeSlot) {
        LocalTime startTime = getTimeSlotStartTime(timeSlot);
        LocalTime endTime = getTimeSlotEndTime(timeSlot);

        return getAvailableSlotsByCenter(centerId, date).stream()
                .filter(slot -> !slot.getStartTime().isBefore(startTime) && slot.getStartTime().isBefore(endTime))
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
     * Generate slots for a doctor within a date range (Virtual Time Slot
     * Implementation)
     * Wrapper for ID-based lookup
     */
    public List<DoctorAvailableSlotResponse> getDoctorSlotsInRange(
            Long doctorId, LocalDate startDate, LocalDate endDate) throws AppException {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException("Doctor not found with id: " + doctorId));
        return getDoctorSlotsInRange(doctor, startDate, endDate);
    }

    /**
     * Core Virtual Slot Generation Logic (Optimized)
     * Tạo slots ảo (virtual) kết hợp với slots thật (booked/blocked) từ DB
     * 
     * @param doctor Doctor object
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc (max 90 ngày)
     * @return List của tất cả slots (virtual + physical) đã được sort
     */
    public List<DoctorAvailableSlotResponse> getDoctorSlotsInRange(
            Doctor doctor, LocalDate startDate, LocalDate endDate) {

        // Validate date range để tránh performance issues
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        if (daysBetween > 90) {
            log.warn("Date range too large for doctor {}: {} days. Limited to 90 days.", 
                doctor.getDoctorId(), daysBetween);
            endDate = startDate.plusDays(90);
        }

        // 1. Get existing "real" slots (Booked/Blocked) from DB
        // Query chỉ lấy slots thật, không lấy AVAILABLE
        List<DoctorAvailableSlot> existingSlots = slotRepository.findDoctorSlotsInRange(
            doctor.getDoctorId(), startDate, endDate);
        
        log.debug("Found {} real slots in DB for doctor {} from {} to {}", 
            existingSlots.size(), doctor.getDoctorId(), startDate, endDate);

        // Build Map với composite key "date_time" để lookup nhanh O(1)
        java.util.Map<String, DoctorAvailableSlot> slotMap = existingSlots.stream()
                .collect(Collectors.toMap(
                        s -> s.getSlotDate().toString() + "_" + s.getStartTime().toString(),
                        s -> s,
                        (existing, replacement) -> {
                            log.warn("Duplicate slot key detected: date={}, time={}", 
                                existing.getSlotDate(), existing.getStartTime());
                            return existing; // Keep first one
                        }));

        // Khởi tạo list với estimated capacity để tránh resize
        int estimatedSlots = (int) (daysBetween * 16); // ~16 slots/ngày (7:00-17:00, 30min each)
        List<DoctorAvailableSlotResponse> allSlots = new java.util.ArrayList<>(estimatedSlots);

        // 2. Use default working hours (7:00 - 17:00) for all days
        // TODO: Future enhancement - implement custom doctor schedules from doctor_schedules table
        // See docs/DOCTOR_SCHEDULE_ENHANCEMENT.md for implementation guide
        LocalTime defaultStartTime = LocalTime.of(7, 0);
        LocalTime defaultEndTime = LocalTime.of(17, 0);
        
        // Get consultation duration once
        int duration = doctor.getConsultationDuration() != null 
            ? doctor.getConsultationDuration() : 30;

        // 3. Iterate through date range and generate virtual slots
        LocalDate currentDate = startDate;
        int virtualSlotCount = 0;
        
        while (!currentDate.isAfter(endDate)) {
            // Generate slots from default working hours
            LocalTime time = defaultStartTime;

            while (time.isBefore(defaultEndTime)) {
                LocalTime endTime = time.plusMinutes(duration);
                
                // Ensure slot doesn't exceed end time
                if (endTime.isAfter(defaultEndTime)) {
                    break;
                }

                String key = currentDate.toString() + "_" + time.toString();

                if (slotMap.containsKey(key)) {
                    // Real slot exists (Booked/Blocked) from DB
                    allSlots.add(toSlotResponse(slotMap.get(key)));
                } else {
                    // Virtual Available Slot - only created in memory
                    allSlots.add(DoctorAvailableSlotResponse.builder()
                            .doctorId(doctor.getDoctorId())
                            .doctorName(doctor.getUser().getFullName())
                            .slotDate(currentDate)
                            .startTime(time)
                            .endTime(endTime)
                            .status(SlotStatus.AVAILABLE)
                            .build());
                    virtualSlotCount++;
                }
                time = endTime;
            }
            currentDate = currentDate.plusDays(1);
        }

        // Sort by date and time - sử dụng Comparator.comparing cho clean code
        allSlots.sort(java.util.Comparator
                .comparing(DoctorAvailableSlotResponse::getSlotDate)
                .thenComparing(DoctorAvailableSlotResponse::getStartTime));

        log.info("Generated {} total slots for doctor {} ({} real, {} virtual)", 
            allSlots.size(), doctor.getDoctorId(), existingSlots.size(), virtualSlotCount);

        return allSlots;
    }

    // Deprecated: No longer needed to physically generate slots
    @Transactional
    public int generateDoctorSlots(Long doctorId, LocalDate startDate, LocalDate endDate) throws AppException {
        log.warn("generateDoctorSlots is deprecated. Using Virtual Time Slots.");
        return 0;
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
        // Get all slots (Virtual + Physical) for the doctor on the given date
        List<DoctorAvailableSlotResponse> slots = getDoctorSlotsInRange(doctor, date, date);

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

        // Get working hours for today
        String workingHours = getWorkingHoursForDate(doctor, date);

        return DoctorWithScheduleResponse.builder()
                .doctorId(doctor.getDoctorId())
                .userId(doctor.getUser().getId())
                .doctorName(doctor.getUser().getFullName())
                .email(doctor.getUser().getEmail())
                .avatar(doctor.getUser().getAvatar())
                .phone(doctor.getUser().getEmail())
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
                .todaySchedule(slots)
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
        String[] dayNames = { "Sunday", "Monday", "Tuesday", "Wednesday",
                "Thursday", "Friday", "Saturday" };

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
