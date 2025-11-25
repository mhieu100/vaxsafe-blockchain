package com.dapp.backend.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "vaccines")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Vaccine extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    long id;
    String slug;
    String name;
    String country;
    String image;
    int price;
    int stock;

    @Column(name = "description_short")
    String descriptionShort;

    @Column(columnDefinition = "text")
    String description;

    @Column(name = "manufacturer", length = 1000)
    String manufacturer;

    @Column(name = "injection", columnDefinition = "TEXT")
    String injection;

    @Column(name = "preserve", columnDefinition = "TEXT")
    String preserve;

    @Column(name = "contraindications", columnDefinition = "TEXT")
    String contraindications;
    
    int dosesRequired;
    int duration;
}
