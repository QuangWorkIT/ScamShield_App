package com.be.scamshield.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "report_evidence")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportEvidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @Column(name = "evidence_type", nullable = false)
    private String evidenceType;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "file_hash")
    private String fileHash;

    @Column(name = "extracted_text")
    private String extractedText;

    @Column(name = "ocr_text")
    private String ocrText;

    @Column(name = "source_url")
    private String sourceUrl;

    @Column(name = "verification_status", nullable = false)
    private String verificationStatus;

    @Column(name = "created_at", nullable = false)
    private java.time.LocalDateTime createdAt;

}
