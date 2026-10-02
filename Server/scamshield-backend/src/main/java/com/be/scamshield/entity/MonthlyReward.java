package com.be.scamshield.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "monthly_rewards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyReward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "reward_month", nullable = false)
    private java.time.LocalDate rewardMonth;

    @Column(name = "total_points", nullable = false)
    private Integer totalPoints;

    @Column(name = "reward_type")
    private String rewardType;

    @Column(name = "reward_value")
    private String rewardValue;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "granted_at")
    private java.time.LocalDateTime grantedAt;

}
