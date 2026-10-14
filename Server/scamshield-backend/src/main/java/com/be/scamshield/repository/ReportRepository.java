package com.be.scamshield.repository;

import com.be.scamshield.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long>, JpaSpecificationExecutor<Report> {
    List<Report> findByReporterUserIdOrderByCreatedAtDesc(Long reporterUserId);
    long countByReporterUserId(Long reporterUserId);
    long countByReporterUserIdAndCreatedAtAfter(Long reporterUserId, LocalDateTime createdAt);
    long countByReporterUserIdAndStatus(Long reporterUserId, String status);
    Optional<Report> findByIdAndReporterUserId(Long id, Long reporterUserId);
}
