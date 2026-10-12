package com.be.scamshield.repository;

import com.be.scamshield.entity.ScamCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScamCategorieRepository extends JpaRepository<ScamCategory, Long> {
    Optional<ScamCategory> findByCode(String code);
    Optional<ScamCategory> findByName(String name);
}
