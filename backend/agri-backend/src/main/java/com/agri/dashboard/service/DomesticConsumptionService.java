package com.agri.dashboard.service;

import com.agri.dashboard.model.DomesticConsumption;
import com.agri.dashboard.repository.DomesticConsumptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DomesticConsumptionService {

    private final DomesticConsumptionRepository consumptionRepository;

    public List<DomesticConsumption> getAllConsumption() {
        log.debug("Fetching all domestic consumption records");
        return consumptionRepository.findAll();
    }

    public List<DomesticConsumption> getConsumptionByCrop(String cropName) {
        log.debug("Fetching consumption for crop: {}", cropName);
        return consumptionRepository.findByCropNameIgnoreCase(cropName);
    }

    public List<DomesticConsumption> getConsumptionByYear(Integer year) {
        log.debug("Fetching consumption for year: {}", year);
        return consumptionRepository.findByYear(year);
    }

    public List<DomesticConsumption> getConsumptionByRegion(String region) {
        log.debug("Fetching consumption for region: {}", region);
        return consumptionRepository.findByRegionIgnoreCaseOrderByYearAsc(region);
    }
}
