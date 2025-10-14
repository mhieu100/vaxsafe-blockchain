package com.dapp.backend.repository;

import com.dapp.backend.model.Order;
import com.dapp.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> , JpaSpecificationExecutor<Order> {
    List<Order> findAllByUser(User user);
}