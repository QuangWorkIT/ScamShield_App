package com.be.scamshield.entity;

import com.be.scamshield.constant.DisputeIndicatorType;
import com.be.scamshield.constant.DisputeLegalRelationship;
import com.be.scamshield.constant.DisputePriority;
import com.be.scamshield.constant.DisputeStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "disputes", indexes = {
        @Index(name = "idx_disputes_submitter_created", columnList = "submitted_by_user_id, created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dispute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "confirmed_indicator_id")
    private ConfirmedIndicator confirmedIndicator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by_user_id")
    private User submittedByUser;

    @Column(name = "submitter_name")
    private String submitterName;

    @Column(name = "submitter_contact")
    private String submitterContact;

    @Column(name = "reason", columnDefinition = "text")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "legal_relationship", length = 40)
    private DisputeLegalRelationship legalRelationship;

    @Column(name = "declaration_accepted_at")
    private LocalDateTime declarationAcceptedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "draft_indicator_type", length = 30)
    private DisputeIndicatorType draftIndicatorType;

    @Column(name = "draft_indicator_value", length = 255)
    private String draftIndicatorValue;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DisputeStatus status = DisputeStatus.PENDING;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, columnDefinition = "varchar(20) default 'NORMAL'")
    private DisputePriority priority = DisputePriority.NORMAL;

    @Column(name = "progress_message", columnDefinition = "text")
    private String progressMessage;

    @Column(name = "estimated_resolution_at")
    private LocalDateTime estimatedResolutionAt;

    @Column(name = "supplement_reason", columnDefinition = "text")
    private String supplementReason;

    @Column(name = "supplement_deadline")
    private LocalDateTime supplementDeadline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedToUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedByUser;

    @Column(name = "resolution_reason")
    private String resolutionReason;

    @Column(name = "resolution_document_url", length = 2048)
    private String resolutionDocumentUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (status == null) status = DisputeStatus.PENDING;
        if (priority == null) priority = DisputePriority.NORMAL;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
    }

}
