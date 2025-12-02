package com.dapp.backend.repository;

import com.dapp.backend.model.Cashier;
import com.dapp.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CashierRepository extends JpaRepository<Cashier, Long> {
    Optional<Cashier> findByUser(User user);
    Optional<Cashier> findByEmployeeCode(String employeeCode);
    boolean existsByEmployeeCode(String employeeCode);
}
