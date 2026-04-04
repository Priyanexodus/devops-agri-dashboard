package com.agri.dashboard.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * JPA Entity → `ethanol_targets` table.
 * Stores the government-mandated blending target % vs. achieved % per year.
 */
@Entity
@Table(name = "ethanol_targets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class EthanolTarget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Min(2000)
    @Column(name = "\"year\"", nullable = false, unique = true)
    private Integer year;

    /** Government mandated blending %, e.g. 20.0 for E20 */
    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    @Column(name = "target_blending_percentage", nullable = false)
    private Double targetBlendingPercentage;

    /** Actual achieved blending % for the year */
    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    @Column(name = "achieved_blending_percentage", nullable = false)
    private Double achievedBlendingPercentage;
}
