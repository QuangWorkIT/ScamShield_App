package com.be.scamshield.repository;

import com.be.scamshield.entity.ScamCategorie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScamCategorieRepository extends JpaRepository<ScamCategorie, Long> {
    Optional<ScamCategorie> findByCode(String code);
    Optional<ScamCategorie> findByName(String name);
}
