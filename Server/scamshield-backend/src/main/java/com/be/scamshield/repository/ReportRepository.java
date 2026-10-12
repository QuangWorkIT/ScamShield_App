package com.be.scamshield.repository;

import com.be.scamshield.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByReporterUserIdOrderByCreatedAtDesc(Long reporterUserId);
}
