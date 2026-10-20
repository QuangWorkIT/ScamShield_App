package com.be.scamshield.entity;

import com.be.scamshield.constant.ReportPriority;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private ScamCategory category;

    @Column(name = "region_code")
    private String regionCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merged_into_report_id")
    private Report mergedIntoReport;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private ReportPriority priority;

    @Column(name = "priority_score")
    private BigDecimal priorityScore;

    @Column(name = "evidence_completeness")
    private Integer evidenceCompleteness;

    @Column(name = "reporter_proposal")
    private String reporterProposal;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "locked_by_user_id")
    private User lockedByUser;

    @Column(name = "locked_at")
    private LocalDateTime lockedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static final BigDecimal PRIORITY_THRESHOLD_URGENT = new BigDecimal("80");
    public static final BigDecimal PRIORITY_THRESHOLD_HIGH = new BigDecimal("50");

    public ReportPriority resolvePriority() {
        if (this.priority != null) {
            return this.priority;
        }
        if (this.priorityScore != null) {
            if (this.priorityScore.compareTo(PRIORITY_THRESHOLD_URGENT) >= 0) {
                return ReportPriority.URGENT;
            } else if (this.priorityScore.compareTo(PRIORITY_THRESHOLD_HIGH) >= 0) {
                return ReportPriority.HIGH;
            }
        }
        return ReportPriority.NORMAL;
    }
}
