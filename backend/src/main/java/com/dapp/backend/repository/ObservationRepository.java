package com.dapp.backend.repository;

import com.dapp.backend.model.Observation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObservationRepository extends JpaRepository<Observation, Long> {
    List<Observation> findByPatientId(Long patientId);

    List<Observation> findByPatientIdOrderByRecordedAtDesc(Long patientId);
}
