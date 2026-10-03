package com.be.scamshield.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quota_usage")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuotaUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_session_id")
    private GuestSession guestSession;

    @Column(name = "usage_date", nullable = false)
    private java.time.LocalDate usageDate;

    @Column(name = "check_count", nullable = false)
    private Integer checkCount;

    @Column(name = "report_count", nullable = false)
    private Integer reportCount;

}
