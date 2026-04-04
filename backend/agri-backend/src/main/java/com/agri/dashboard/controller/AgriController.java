package com.agri.dashboard.controller;

import com.agri.dashboard.model.CropYield;
import com.agri.dashboard.model.DomesticConsumption;
import com.agri.dashboard.model.EthanolTarget;
import com.agri.dashboard.service.CropYieldService;
import com.agri.dashboard.service.DomesticConsumptionService;
import com.agri.dashboard.service.EthanolTargetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller — exposes the same three API paths the React frontend calls:
 *
 *   GET /api/yields            → replaces FastAPI @router.get("/api/yields")
 *   GET /api/consumption       → replaces FastAPI @router.get("/api/consumption")
 *   GET /api/ethanol-targets   → replaces FastAPI @router.get("/api/ethanol-targets")
 *   GET /api/health            → used by Docker healthcheck and Jenkins smoke test
 *
 * Optional query parameters allow the frontend filter panel to narrow results.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class AgriController {

    private final CropYieldService cropYieldService;
    private final DomesticConsumptionService consumptionService;
    private final EthanolTargetService ethanolTargetService;

    // ─── GET /api/yields ──────────────────────────────────────────────────────

    /**
     * @param crop   optional — filter by crop name  e.g. ?crop=Sugarcane
     * @param year   optional — filter by year        e.g. ?year=2023
     * @param region optional — filter by region      e.g. ?region=Maharashtra
     */
    @GetMapping("/yields")
    public ResponseEntity<List<CropYield>> getYields(
            @RequestParam(required = false) String crop,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String region) {

        log.info("GET /api/yields | crop={} year={} region={}", crop, year, region);

        List<CropYield> result;
        if (crop != null)        { result = cropYieldService.getYieldsByCrop(crop); }
        else if (year != null)   { result = cropYieldService.getYieldsByYear(year); }
        else if (region != null) { result = cropYieldService.getYieldsByRegion(region); }
        else                     { result = cropYieldService.getAllYields(); }

        return ResponseEntity.ok(result);
    }

    // ─── GET /api/consumption ─────────────────────────────────────────────────

    @GetMapping("/consumption")
    public ResponseEntity<List<DomesticConsumption>> getConsumption(
            @RequestParam(required = false) String crop,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String region) {

        log.info("GET /api/consumption | crop={} year={} region={}", crop, year, region);

        List<DomesticConsumption> result;
        if (crop != null)        { result = consumptionService.getConsumptionByCrop(crop); }
        else if (year != null)   { result = consumptionService.getConsumptionByYear(year); }
        else if (region != null) { result = consumptionService.getConsumptionByRegion(region); }
        else                     { result = consumptionService.getAllConsumption(); }

        return ResponseEntity.ok(result);
    }

    // ─── GET /api/ethanol-targets ─────────────────────────────────────────────

    /**
     * @param fromYear optional start of year range e.g. ?fromYear=2022
     * @param toYear   optional end of year range   e.g. ?toYear=2024
     */
    @GetMapping("/ethanol-targets")
    public ResponseEntity<List<EthanolTarget>> getEthanolTargets(
            @RequestParam(required = false) Integer fromYear,
            @RequestParam(required = false) Integer toYear) {

        log.info("GET /api/ethanol-targets | fromYear={} toYear={}", fromYear, toYear);

        List<EthanolTarget> result;
        if (fromYear != null && toYear != null) {
            result = ethanolTargetService.getTargetsByYearRange(fromYear, toYear);
        } else {
            result = ethanolTargetService.getAllTargets();
        }

        return ResponseEntity.ok(result);
    }

    // ─── GET /api/health ──────────────────────────────────────────────────────

    /** Docker healthcheck + Jenkins smoke test probe */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        log.debug("Health check hit");
        return ResponseEntity.ok("{\"status\":\"UP\"}");
    }
}
