package com.be.scamshield.repository;

import com.be.scamshield.entity.QuotaPolicie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuotaPolicyRepository extends JpaRepository<QuotaPolicie, Long> {

    Optional<QuotaPolicie> findByName(String name);

    Optional<QuotaPolicie> findByNameIgnoreCase(String name);

    Optional<QuotaPolicie> findByRankId(Long rankId);
}
