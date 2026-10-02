package com.be.scamshield.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_user_id", nullable = false)
    private User reporterUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "indicator_id", nullable = false)
    private Indicator indicator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_check_request_id")
    private CheckRequest sourceCheckRequest;

    @Column(name = "reported_message")
    private String reportedMessage;

    @Column(name = "description")
    private String description;

    @Column(name = "status", nullable = false)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ScamCategorie category;

    @Column(name = "region_code")
    private String regionCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merged_into_report_id")
    private Report mergedIntoReport;

    @Column(name = "priority_score")
    private java.math.BigDecimal priorityScore;

    @Column(name = "report_count_signal", nullable = false)
    private Integer reportCountSignal;

    @Column(name = "ip_hash")
    private String ipHash;

    @Column(name = "device_fingerprint_hash")
    private String deviceFingerprintHash;

    @Column(name = "coordinated_report_suspected", nullable = false)
    private Boolean coordinatedReportSuspected;

    @Column(name = "moderation_locked", nullable = false)
    private Boolean moderationLocked;

    @Column(name = "created_at", nullable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private java.time.LocalDateTime updatedAt;

}
