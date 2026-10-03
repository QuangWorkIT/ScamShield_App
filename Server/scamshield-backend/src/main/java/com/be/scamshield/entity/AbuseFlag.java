package com.be.scamshield.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "abuse_flags")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AbuseFlag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private Report report;

    @Column(name = "flag_type", nullable = false)
    private String flagType;

    @Column(name = "severity", nullable = false)
    private String severity;

    @Column(name = "reason")
    private String reason;

    @Column(name = "evidence")
    private String evidence;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private java.time.LocalDateTime resolvedAt;

}
