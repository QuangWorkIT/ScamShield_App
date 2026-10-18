package com.be.scamshield.repository;

import com.be.scamshield.entity.AbuseFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AbuseFlagRepository extends JpaRepository<AbuseFlag, Long> {

    List<AbuseFlag> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<AbuseFlag> findByUserIdAndStatus(Long userId, String status);

    long countByStatus(String status);

}
