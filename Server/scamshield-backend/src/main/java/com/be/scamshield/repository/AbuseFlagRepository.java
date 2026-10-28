package com.be.scamshield.repository;

import com.be.scamshield.entity.AbuseFlag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface AbuseFlagRepository extends JpaRepository<AbuseFlag, Long>, JpaSpecificationExecutor<AbuseFlag> {

    @Override
    @EntityGraph(attributePaths = {"user", "createdBy", "report"})
    Page<AbuseFlag> findAll(Specification<AbuseFlag> spec, Pageable pageable);

    List<AbuseFlag> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<AbuseFlag> findByUserIdAndStatus(Long userId, String status);

    long countByStatus(String status);

    boolean existsByUserIdAndStatus(Long userId, String status);

    @EntityGraph(attributePaths = {"report", "createdBy"})
    Page<AbuseFlag> findByUserIdAndStatusIn(Long userId, Collection<String> statuses, Pageable pageable);

}
