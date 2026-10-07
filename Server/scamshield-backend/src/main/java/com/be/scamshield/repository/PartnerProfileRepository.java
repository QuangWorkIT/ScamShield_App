package com.be.scamshield.repository;

import com.be.scamshield.entity.PartnerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartnerProfileRepository extends JpaRepository<PartnerProfile, Long> {
    boolean existsByTaxCode(String taxCode);
}
