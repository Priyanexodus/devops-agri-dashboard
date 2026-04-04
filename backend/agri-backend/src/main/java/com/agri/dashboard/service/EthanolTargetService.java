package com.agri.dashboard.service;

import com.agri.dashboard.model.EthanolTarget;
import com.agri.dashboard.repository.EthanolTargetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class EthanolTargetService {

    private final EthanolTargetRepository ethanolTargetRepository;

    public List<EthanolTarget> getAllTargets() {
        log.debug("Fetching all ethanol target records");
        return ethanolTargetRepository.findAll();
    }

    public List<EthanolTarget> getTargetsByYearRange(Integer fromYear, Integer toYear) {
        log.debug("Fetching ethanol targets from {} to {}", fromYear, toYear);
        return ethanolTargetRepository.findByYearBetweenOrderByYearAsc(fromYear, toYear);
    }
}
