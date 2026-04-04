package com.agri.dashboard.repository;

import com.agri.dashboard.model.EthanolTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EthanolTargetRepository extends JpaRepository<EthanolTarget, Long> {

    Optional<EthanolTarget> findByYear(Integer year);

    List<EthanolTarget> findByYearBetweenOrderByYearAsc(Integer fromYear, Integer toYear);
}
