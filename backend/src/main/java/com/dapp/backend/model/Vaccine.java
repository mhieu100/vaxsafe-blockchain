package com.dapp.backend.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Entity
@Table(name = "vaccines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Vaccine {
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

    @ElementCollection
    @CollectionTable(name = "vaccine_injection", joinColumns = @JoinColumn(name = "vaccine_id"))
    @Column(name = "injection")
    List<String> injection;

    @ElementCollection
    @CollectionTable(name = "vaccine_preserve", joinColumns = @JoinColumn(name = "vaccine_id"))
    @Column(name = "preserve")
    List<String> preserve;

    @ElementCollection
    @CollectionTable(name = "vaccine_contraindications", joinColumns = @JoinColumn(name = "vaccine_id"))
    @Column(name = "contraindication")
    List<String> contraindications;
    int dosesRequired;
    int duration;
}
