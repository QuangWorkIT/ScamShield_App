package com.be.scamshield.repository;

import com.be.scamshield.constant.DisputeStatus;
import com.be.scamshield.entity.Dispute;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface DisputeRepository extends JpaRepository<Dispute, Long>, JpaSpecificationExecutor<Dispute> {
    @Override
    @EntityGraph(attributePaths = {"confirmedIndicator", "confirmedIndicator.indicator"})
    Page<Dispute> findAll(Specification<Dispute> specification, Pageable pageable);

    @Query("""
            SELECT d.status AS status, COUNT(d) AS total FROM Dispute d
            WHERE d.submittedByUser.id = :userId GROUP BY d.status
            """)
    List<StatusCount> countStatuses(Long userId);

    @Query("""
            SELECT AVG(timestampdiff(SECOND, d.createdAt, d.resolvedAt)) FROM Dispute d
            WHERE d.submittedByUser.id = :userId AND d.status IN :resolvedStatuses
              AND d.resolvedAt IS NOT NULL AND d.resolvedAt >= d.createdAt AND d.resolvedAt <= :now
            """)
    Double averageResolutionSeconds(Long userId, Collection<DisputeStatus> resolvedStatuses, LocalDateTime now);

    interface StatusCount {
        DisputeStatus getStatus();
        Long getTotal();
    }
}
