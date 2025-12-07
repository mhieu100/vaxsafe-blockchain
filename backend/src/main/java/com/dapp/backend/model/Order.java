package com.dapp.backend.model;

import com.dapp.backend.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Order extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long orderId;
    double totalAmount;
    int itemCount;
    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "order")
    List<OrderItem> orderItems;
    @Temporal(TemporalType.TIMESTAMP)
    LocalDateTime orderDate;
    @Enumerated(EnumType.STRING)
    OrderStatus status;
}
