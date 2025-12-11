package com.dapp.backend.service;

import com.dapp.backend.dto.response.DoctorAvailableSlotResponse;
import com.dapp.backend.dto.response.DoctorResponse;
import com.dapp.backend.dto.response.DoctorWithScheduleResponse;
import com.dapp.backend.enums.SlotStatus;
import com.dapp.backend.enums.TimeSlotEnum;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Doctor;
import com.dapp.backend.model.DoctorAvailableSlot;
import com.dapp.backend.repository.DoctorAvailableSlotRepository;
import com.dapp.backend.repository.DoctorRepository;
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
    DoctorAvailableSlotRepository slotRepository;

    public List<DoctorResponse> getAvailableDoctorsByCenter(Long centerId) {
        return doctorRepository.findByCenter_CenterIdAndIsAvailableTrue(centerId)
                .stream()
                .map(this::toDoctorResponse)
                .collect(Collectors.toList());
    }

    public List<DoctorWithScheduleResponse> getDoctorsWithTodaySchedule(Long centerId, LocalDate date) {
        List<Doctor> doctors = doctorRepository.findByCenter_CenterIdAndIsAvailableTrue(centerId);

        return doctors.stream()
                .map(doctor -> toDoctorWithScheduleResponse(doctor, date))
                .collect(Collectors.toList());
    }

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

    public List<DoctorAvailableSlotResponse> getAvailableSlotsByCenter(Long centerId, LocalDate date) {

        List<Doctor> doctors = doctorRepository.findByCenter_CenterIdAndIsAvailableTrue(centerId);

        if (doctors.isEmpty()) {
            log.warn("No available doctors found for center {}", centerId);
            return List.of();
        }

        List<Long> doctorIds = doctors.stream()
                .map(Doctor::getDoctorId)
                .collect(Collectors.toList());

        List<DoctorAvailableSlot> existingSlots = slotRepository.findSlotsByDoctorIdsAndDateRange(doctorIds, date,
                date);

        log.debug("Batch query found {} real slots for {} doctors in center {}",
                existingSlots.size(), doctors.size(), centerId);

        java.util.Map<Long, List<DoctorAvailableSlot>> slotsByDoctor = existingSlots.stream()
                .collect(Collectors.groupingBy(s -> s.getDoctor().getDoctorId()));

        return doctors.stream()
                .flatMap(doctor -> {

                    List<DoctorAvailableSlot> doctorRealSlots = slotsByDoctor.getOrDefault(doctor.getDoctorId(),
                            List.of());

                    return generateSlotsForDate(doctor, date, doctorRealSlots).stream();
                })
                .filter(slot -> slot.getStatus() == SlotStatus.AVAILABLE)
                .sorted(java.util.Comparator
                        .comparing(DoctorAvailableSlotResponse::getStartTime)
                        .thenComparing(DoctorAvailableSlotResponse::getDoctorId))
                .collect(Collectors.toList());
    }

    private List<DoctorAvailableSlotResponse> generateSlotsForDate(
            Doctor doctor, LocalDate date, List<DoctorAvailableSlot> existingSlots) {

        java.util.Map<String, DoctorAvailableSlot> slotMap = existingSlots.stream()
                .collect(Collectors.toMap(
                        s -> s.getSlotDate().toString() + "_" + s.getStartTime().toString(),
                        s -> s,
                        (existing, replacement) -> existing));

        List<DoctorAvailableSlotResponse> slots = new java.util.ArrayList<>();

        LocalTime startTime = LocalTime.of(7, 0);
        LocalTime endTime = LocalTime.of(17, 0);

        int duration = doctor.getConsultationDuration() != null
                ? doctor.getConsultationDuration()
                : 30;

        LocalTime time = startTime;

        while (time.isBefore(endTime)) {
            LocalTime slotEnd = time.plusMinutes(duration);
            if (slotEnd.isAfter(endTime))
                break;

            String key = date.toString() + "_" + time.toString();

            if (slotMap.containsKey(key)) {
                slots.add(toSlotResponse(slotMap.get(key)));
            } else {
                slots.add(DoctorAvailableSlotResponse.builder()
                        .doctorId(doctor.getDoctorId())
                        .doctorName(doctor.getUser().getFullName())
                        .slotDate(date)
                        .startTime(time)
                        .endTime(slotEnd)
                        .status(SlotStatus.AVAILABLE)
                        .build());
            }
            time = slotEnd;
        }

        return slots;
    }

    public List<DoctorAvailableSlotResponse> getAvailableSlotsByCenterAndTimeSlot(
            Long centerId, LocalDate date, TimeSlotEnum timeSlot) {
        LocalTime startTime = getTimeSlotStartTime(timeSlot);
        LocalTime endTime = getTimeSlotEndTime(timeSlot);

        return getAvailableSlotsByCenter(centerId, date).stream()
                .filter(slot -> !slot.getStartTime().isBefore(startTime) && slot.getStartTime().isBefore(endTime))
                .collect(Collectors.toList());
    }

    private LocalTime getTimeSlotStartTime(TimeSlotEnum timeSlot) {
        return switch (timeSlot) {
            case SLOT_07_00 -> LocalTime.of(7, 0);
            case SLOT_09_00 -> LocalTime.of(9, 0);
            case SLOT_11_00 -> LocalTime.of(11, 0);
            case SLOT_13_00 -> LocalTime.of(13, 0);
            case SLOT_15_00 -> LocalTime.of(15, 0);
        };
    }

    private LocalTime getTimeSlotEndTime(TimeSlotEnum timeSlot) {
        return getTimeSlotStartTime(timeSlot).plusHours(2);
    }

    public List<DoctorAvailableSlotResponse> getDoctorSlotsInRange(
            Long doctorId, LocalDate startDate, LocalDate endDate) throws AppException {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException("Doctor not found with id: " + doctorId));
        return getDoctorSlotsInRange(doctor, startDate, endDate);
    }

    public List<DoctorAvailableSlotResponse> getDoctorSlotsInRange(
            Doctor doctor, LocalDate startDate, LocalDate endDate) {

        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        if (daysBetween > 90) {
            log.warn("Date range too large for doctor {}: {} days. Limited to 90 days.",
                    doctor.getDoctorId(), daysBetween);
            endDate = startDate.plusDays(90);
        }

        List<DoctorAvailableSlot> existingSlots = slotRepository.findDoctorSlotsInRange(
                doctor.getDoctorId(), startDate, endDate);

        log.debug("Found {} real slots in DB for doctor {} from {} to {}",
                existingSlots.size(), doctor.getDoctorId(), startDate, endDate);

        java.util.Map<String, DoctorAvailableSlot> slotMap = existingSlots.stream()
                .collect(Collectors.toMap(
                        s -> s.getSlotDate().toString() + "_" + s.getStartTime().toString(),
                        s -> s,
                        (existing, replacement) -> {
                            log.warn("Duplicate slot key detected: date={}, time={}",
                                    existing.getSlotDate(), existing.getStartTime());
                            return existing;
                        }));

        int estimatedSlots = (int) (daysBetween * 16);
        List<DoctorAvailableSlotResponse> allSlots = new java.util.ArrayList<>(estimatedSlots);

        LocalTime defaultStartTime = LocalTime.of(7, 0);
        LocalTime defaultEndTime = LocalTime.of(17, 0);

        int duration = doctor.getConsultationDuration() != null
                ? doctor.getConsultationDuration()
                : 30;

        LocalDate currentDate = startDate;
        int virtualSlotCount = 0;

        while (!currentDate.isAfter(endDate)) {

            LocalTime time = defaultStartTime;

            while (time.isBefore(defaultEndTime)) {
                LocalTime endTime = time.plusMinutes(duration);

                if (endTime.isAfter(defaultEndTime)) {
                    break;
                }

                String key = currentDate.toString() + "_" + time.toString();

                if (slotMap.containsKey(key)) {

                    allSlots.add(toSlotResponse(slotMap.get(key)));
                } else {

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

        allSlots.sort(java.util.Comparator
                .comparing(DoctorAvailableSlotResponse::getSlotDate)
                .thenComparing(DoctorAvailableSlotResponse::getStartTime));

        log.info("Generated {} total slots for doctor {} ({} real, {} virtual)",
                allSlots.size(), doctor.getDoctorId(), existingSlots.size(), virtualSlotCount);

        return allSlots;
    }

    @Transactional
    public int generateDoctorSlots(Long doctorId, LocalDate startDate, LocalDate endDate) throws AppException {
        log.warn("generateDoctorSlots is deprecated. Using Virtual Time Slots.");
        return 0;
    }

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

        List<DoctorAvailableSlotResponse> slots = getDoctorSlotsInRange(doctor, date, date);

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

        return "07:00 - 17:00";
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
