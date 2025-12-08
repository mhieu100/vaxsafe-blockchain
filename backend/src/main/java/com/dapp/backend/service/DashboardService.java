package com.dapp.backend.service;

import com.dapp.backend.dto.response.CashierDashboardStatsResponse;
import com.dapp.backend.dto.response.DashboardStatsResponse;
import com.dapp.backend.dto.response.DoctorDashboardStatsResponse;
import com.dapp.backend.enums.AppointmentStatus;
import com.dapp.backend.model.Appointment;
import com.dapp.backend.model.Center;
import com.dapp.backend.model.User;
import com.dapp.backend.model.Vaccine;
import com.dapp.backend.repository.*;
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
        private final UserRepository userRepository;
        private final CenterRepository centerRepository;
        private final VaccineRepository vaccineRepository;
        private final AppointmentRepository appointmentRepository;

        public DashboardStatsResponse getStats() {

                long totalPatients = patientRepository.count();
                long totalDoctors = userRepository.countByRole_Name("DOCTOR");
                long totalCenters = centerRepository.count();
                long totalVaccines = vaccineRepository.count();

                long pendingAppointments = appointmentRepository
                                .count((root, query, cb) -> cb.equal(root.get("status"), AppointmentStatus.PENDING));
                long completedAppointments = appointmentRepository
                                .count((root, query, cb) -> cb.equal(root.get("status"), AppointmentStatus.COMPLETED));
                long cancelledAppointments = appointmentRepository
                                .count((root, query, cb) -> cb.equal(root.get("status"), AppointmentStatus.CANCELLED));
                long totalAppointments = appointmentRepository.count();

                LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
                List<Object[]> dailyCounts = appointmentRepository.countAppointmentsByDateSince(thirtyDaysAgo);

                List<DashboardStatsResponse.DailyStat> dailyStats = dailyCounts.stream()
                                .map(row -> new DashboardStatsResponse.DailyStat(
                                                row[0].toString(),
                                                ((Number) row[1]).longValue()))
                                .collect(Collectors.toList());

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

        public DoctorDashboardStatsResponse getDoctorStats(Long userId) {
                User doctorUser = userRepository.findById(userId)
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

                double rating = 4.8;

                Appointment nextApt = appointmentRepository
                                .findFirstByDoctorAndStatusAndScheduledDateGreaterThanEqualOrderByScheduledDateAscScheduledTimeSlotAsc(
                                                doctorUser, AppointmentStatus.SCHEDULED, today);

                DoctorDashboardStatsResponse.NextAppointmentInfo nextAptInfo = null;
                if (nextApt != null) {
                        nextAptInfo = new DoctorDashboardStatsResponse.NextAppointmentInfo(
                                        nextApt.getScheduledTimeSlot().toString(),
                                        nextApt.getPatient().getFullName(),
                                        nextApt.getVaccine().getName());
                }

                return DoctorDashboardStatsResponse.builder()
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

        public CashierDashboardStatsResponse getCashierStats(Long userId) {
                User cashierUser = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("Cashier not found"));

                Center center = null;
                if (cashierUser.getCashier() != null) {
                        center = cashierUser.getCashier().getCenter();
                }

                if (center == null) {
                        return CashierDashboardStatsResponse.builder().build();
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

                return CashierDashboardStatsResponse.builder()
                                .urgentAppointments(urgentAppointments)
                                .todayAppointments(todayAppointments)
                                .weekCompleted(weekCompleted)
                                .weekCancelled(weekCancelled)
                                .build();
        }
}
