package com.dapp.backend.service;

import com.dapp.backend.dto.response.DashboardStatsResponse;
import com.dapp.backend.enums.AppointmentStatus;
import com.dapp.backend.model.Vaccine;
import com.dapp.backend.repository.AppointmentRepository;
import com.dapp.backend.repository.CenterRepository;
import com.dapp.backend.repository.PatientRepository;
import com.dapp.backend.repository.UserRepository;
import com.dapp.backend.repository.VaccineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

        private final PatientRepository patientRepository;
        private final UserRepository userRepository; // For doctors (via role)
        private final CenterRepository centerRepository;
        private final VaccineRepository vaccineRepository;
        private final AppointmentRepository appointmentRepository;

        public DashboardStatsResponse getStats() {
                // 1. Basic Counts
                long totalPatients = patientRepository.count();
                long totalDoctors = userRepository.countByRole_Name("DOCTOR");
                long totalCenters = centerRepository.count();
                long totalVaccines = vaccineRepository.count();

                // 2. Appointment Stats
                long pendingAppointments = appointmentRepository
                                .count((root, query, cb) -> cb.equal(root.get("status"), AppointmentStatus.PENDING));
                long completedAppointments = appointmentRepository
                                .count((root, query, cb) -> cb.equal(root.get("status"), AppointmentStatus.COMPLETED));
                long cancelledAppointments = appointmentRepository
                                .count((root, query, cb) -> cb.equal(root.get("status"), AppointmentStatus.CANCELLED));
                long totalAppointments = appointmentRepository.count();

                // 3. Daily Appointments (Last 30 days)
                LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
                List<Object[]> dailyCounts = appointmentRepository.countAppointmentsByDateSince(thirtyDaysAgo);

                List<DashboardStatsResponse.DailyStat> dailyStats = dailyCounts.stream()
                                .map(row -> new DashboardStatsResponse.DailyStat(
                                                row[0].toString(),
                                                ((Number) row[1]).longValue()))
                                .collect(Collectors.toList());

                // 4. Vaccine Distribution (by Country for now as proxy for type)
                List<Vaccine> vaccines = vaccineRepository.findAll();
                Map<String, Long> vaccineDistribution = vaccines.stream()
                                .collect(Collectors.groupingBy(
                                                v -> v.getCountry() != null ? v.getCountry() : "Unknown",
                                                Collectors.counting()));

                return DashboardStatsResponse.builder()
                                .totalPatients(totalPatients)
                                .totalDoctors(totalDoctors)
                                .totalCenters(totalCenters)
                                .totalVaccines(totalVaccines)
                                .pendingAppointments(pendingAppointments)
                                .completedAppointments(completedAppointments)
                                .cancelledAppointments(cancelledAppointments)
                                .totalAppointments(totalAppointments)
                                .dailyAppointments(dailyStats)
                                .vaccineDistribution(vaccineDistribution)
                                .build();
        }

        public com.dapp.backend.dto.response.DoctorDashboardStatsResponse getDoctorStats(Long userId) {
                com.dapp.backend.model.User doctorUser = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("Doctor not found"));

                LocalDate today = LocalDate.now();
                LocalDate startOfWeek = today.with(java.time.DayOfWeek.MONDAY);
                LocalDate endOfWeek = today.with(java.time.DayOfWeek.SUNDAY);
                LocalDate startOfMonth = today.withDayOfMonth(1);
                LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());

                long todayAppointments = appointmentRepository.countByDoctorAndScheduledDate(doctorUser, today);
                long weekAppointments = appointmentRepository.countByDoctorAndScheduledDateBetween(doctorUser,
                                startOfWeek, endOfWeek);
                long weekCompleted = appointmentRepository.countByDoctorAndStatusAndScheduledDateBetween(doctorUser,
                                AppointmentStatus.COMPLETED, startOfWeek, endOfWeek);
                long weekCancelled = appointmentRepository.countByDoctorAndStatusAndScheduledDateBetween(doctorUser,
                                AppointmentStatus.CANCELLED, startOfWeek, endOfWeek);
                long weekInProgress = appointmentRepository.countByDoctorAndStatusAndScheduledDateBetween(doctorUser,
                                AppointmentStatus.SCHEDULED, startOfWeek, endOfWeek);

                long monthCompleted = appointmentRepository.countByDoctorAndStatusAndScheduledDateBetween(doctorUser,
                                AppointmentStatus.COMPLETED, startOfMonth, endOfMonth);

                // Mock rating for now
                double rating = 4.8;

                com.dapp.backend.model.Appointment nextApt = appointmentRepository
                                .findFirstByDoctorAndStatusAndScheduledDateGreaterThanEqualOrderByScheduledDateAscScheduledTimeSlotAsc(
                                                doctorUser, AppointmentStatus.SCHEDULED, today);

                com.dapp.backend.dto.response.DoctorDashboardStatsResponse.NextAppointmentInfo nextAptInfo = null;
                if (nextApt != null && nextApt.getBooking() != null) {
                        nextAptInfo = new com.dapp.backend.dto.response.DoctorDashboardStatsResponse.NextAppointmentInfo(
                                        nextApt.getScheduledTimeSlot().toString(),
                                        nextApt.getBooking().getPatient().getFullName(),
                                        nextApt.getBooking().getVaccine().getName());
                }

                return com.dapp.backend.dto.response.DoctorDashboardStatsResponse.builder()
                                .todayAppointments(todayAppointments)
                                .weekAppointments(weekAppointments)
                                .weekCompleted(weekCompleted)
                                .weekCancelled(weekCancelled)
                                .weekInProgress(weekInProgress)
                                .monthCompleted(monthCompleted)
                                .rating(rating)
                                .nextAppointment(nextAptInfo)
                                .build();
        }

        public com.dapp.backend.dto.response.CashierDashboardStatsResponse getCashierStats(Long userId) {
                com.dapp.backend.model.User cashierUser = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("Cashier not found"));

                com.dapp.backend.model.Center center = null;
                if (cashierUser.getCashier() != null) {
                        center = cashierUser.getCashier().getCenter();
                }

                if (center == null) {
                        return com.dapp.backend.dto.response.CashierDashboardStatsResponse.builder().build();
                }

                LocalDate today = LocalDate.now();
                LocalDate startOfWeek = today.with(java.time.DayOfWeek.MONDAY);
                LocalDate endOfWeek = today.with(java.time.DayOfWeek.SUNDAY);

                long urgentAppointments = appointmentRepository.countByCenterAndStatus(center,
                                AppointmentStatus.RESCHEDULE);

                long todayAppointments = appointmentRepository.countByCenterAndScheduledDate(center, today);
                long weekCompleted = appointmentRepository.countByCenterAndStatusAndScheduledDateBetween(center,
                                AppointmentStatus.COMPLETED, startOfWeek, endOfWeek);
                long weekCancelled = appointmentRepository.countByCenterAndStatusAndScheduledDateBetween(center,
                                AppointmentStatus.CANCELLED, startOfWeek, endOfWeek);

                return com.dapp.backend.dto.response.CashierDashboardStatsResponse.builder()
                                .urgentAppointments(urgentAppointments)
                                .todayAppointments(todayAppointments)
                                .weekCompleted(weekCompleted)
                                .weekCancelled(weekCancelled)
                                .build();
        }
}
