package com.agri.dashboard.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * JPA Entity → `crop_yields` table.
 * Represents annual yield of a crop in a given region (in million metric tons).
 * No ML logic — data is seeded via Flyway V2__seed_dummy_data.sql.
 */
@Entity
@Table(name = "crop_yields")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class CropYield {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotBlank(message = "Crop name must not be blank")
    @Column(name = "crop_name", nullable = false, length = 100)
    private String cropName;

    @NotNull(message = "Year is required")
    @Min(value = 2000, message = "Year must be >= 2000")
    @Column(name = "\"year\"", nullable = false)
    private Integer year;

    /** Yield in million metric tons */
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "yield_amount", nullable = false)
    private Double yieldAmount;

    @NotBlank
    @Column(name = "region", nullable = false, length = 100)
    private String region;
}
