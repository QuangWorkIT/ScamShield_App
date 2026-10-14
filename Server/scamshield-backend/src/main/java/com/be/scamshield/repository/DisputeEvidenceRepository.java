package com.be.scamshield.repository;

import com.be.scamshield.entity.DisputeEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface DisputeEvidenceRepository extends JpaRepository<DisputeEvidence, Long> {
    @Query("""
            SELECT e.dispute.id AS disputeId, e.id AS id, e.evidenceType AS evidenceType,
                   e.fileName AS fileName, e.fileUrl AS fileUrl, e.description AS description,
                   e.verificationStatus AS verificationStatus, e.createdAt AS createdAt
            FROM DisputeEvidence e WHERE e.dispute.id IN :disputeIds
              AND e.fileUrl IS NOT NULL AND TRIM(e.fileUrl) <> ''
            ORDER BY e.createdAt ASC, e.id ASC
            """)
    List<FileEvidence> findFilesForDisputes(Collection<Long> disputeIds);

    interface FileEvidence {
        Long getDisputeId();
        Long getId();
        String getEvidenceType();
        String getFileName();
        String getFileUrl();
        String getDescription();
        String getVerificationStatus();
        LocalDateTime getCreatedAt();
    }
}
