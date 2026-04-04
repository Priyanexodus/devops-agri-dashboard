package com.agri.dashboard.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * JPA Entity → `domestic_consumption` table.
 * Tracks domestic consumption of each crop per year per region (million metric tons).
 */
@Entity
@Table(name = "domestic_consumption")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class DomesticConsumption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotBlank
    @Column(name = "crop_name", nullable = false, length = 100)
    private String cropName;

    @NotNull
    @Min(2000)
    @Column(name = "\"year\"", nullable = false)
    private Integer year;

    /** Consumption in million metric tons */
    @NotNull
    @DecimalMin("0.0")
    @Column(name = "consumption_amount", nullable = false)
    private Double consumptionAmount;

    @NotBlank
    @Column(name = "region", nullable = false, length = 100)
    private String region;
}
