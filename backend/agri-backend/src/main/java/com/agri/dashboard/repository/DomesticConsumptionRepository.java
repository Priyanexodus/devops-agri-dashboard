package com.agri.dashboard.repository;

import com.agri.dashboard.model.DomesticConsumption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DomesticConsumptionRepository extends JpaRepository<DomesticConsumption, Long> {

    List<DomesticConsumption> findByCropNameIgnoreCase(String cropName);

    List<DomesticConsumption> findByYear(Integer year);

    List<DomesticConsumption> findByRegionIgnoreCaseOrderByYearAsc(String region);
}
