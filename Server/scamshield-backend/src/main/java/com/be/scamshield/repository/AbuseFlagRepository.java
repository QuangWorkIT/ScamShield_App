package com.be.scamshield.repository;

import com.be.scamshield.entity.AbuseFlag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface AbuseFlagRepository extends JpaRepository<AbuseFlag, Long> {

    List<AbuseFlag> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<AbuseFlag> findByUserIdAndStatus(Long userId, String status);

    long countByStatus(String status);

    @EntityGraph(attributePaths = {"report"})
    Page<AbuseFlag> findByUserIdAndStatusIn(Long userId, Collection<String> statuses, Pageable pageable);

}
