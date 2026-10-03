package com.be.scamshield.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dispute_evidence")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisputeEvidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispute_id", nullable = false)
    private Dispute dispute;

    @Column(name = "evidence_type", nullable = false)
    private String evidenceType;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "file_hash")
    private String fileHash;

    @Column(name = "description")
    private String description;

    @Column(name = "verification_status", nullable = false)
    private String verificationStatus;

    @Column(name = "created_at", nullable = false)
    private java.time.LocalDateTime createdAt;

}
