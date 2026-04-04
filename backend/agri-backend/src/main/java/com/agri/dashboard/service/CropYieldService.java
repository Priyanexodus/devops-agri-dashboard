package com.agri.dashboard.service;

import com.agri.dashboard.model.CropYield;
import com.agri.dashboard.repository.CropYieldRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer for CropYield domain.
 *
 * IMPORTANT: There is zero Machine Learning logic here.
 * All data is served directly from PostgreSQL, pre-seeded by
 * Flyway migration V2__seed_dummy_data.sql at application startup.
 *
 * @Transactional(readOnly = true) — all operations are reads only;
 * this hint allows Hibernate to skip dirty-checking and improves performance.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CropYieldService {

    private final CropYieldRepository cropYieldRepository;

    public List<CropYield> getAllYields() {
        log.debug("Fetching all crop yield records");
        return cropYieldRepository.findAll();
    }

    public List<CropYield> getYieldsByCrop(String cropName) {
        log.debug("Fetching yields for crop: {}", cropName);
        return cropYieldRepository.findByCropNameIgnoreCase(cropName);
    }

    public List<CropYield> getYieldsByYear(Integer year) {
        log.debug("Fetching yields for year: {}", year);
        return cropYieldRepository.findByYear(year);
    }

    public List<CropYield> getYieldsByRegion(String region) {
        log.debug("Fetching yields for region: {}", region);
        return cropYieldRepository.findByRegionIgnoreCaseOrderByYearAsc(region);
    }
}
