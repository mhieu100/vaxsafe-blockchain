package com.dapp.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dapp.backend.model.Payment;
import com.dapp.backend.enums.TypeTransactionEnum;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    @Query("SELECT p FROM Payment p WHERE p.referenceId = :appointmentId AND p.referenceType = :referenceType")
    Optional<Payment> findByAppointmentId(@Param("appointmentId") Long appointmentId, @Param("referenceType") TypeTransactionEnum referenceType);
}


