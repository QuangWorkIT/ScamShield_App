package com.be.scamshield.repository;

import com.be.scamshield.entity.Indicator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Collection;
import java.util.List;

@Repository
public interface IndicatorRepository extends JpaRepository<Indicator, Long> {
    Optional<Indicator> findByTypeAndNormalizedValue(String type, String normalizedValue);

    List<Indicator> findByTypeAndNormalizedValueInOrderByIdAsc(String type, Collection<String> values);
}
