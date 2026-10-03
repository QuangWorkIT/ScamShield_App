package com.be.scamshield.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_alert_subscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAlertSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ScamCategorie category;

    @Column(name = "region_code")
    private String regionCode;

    @Column(name = "subscribed_at", nullable = false)
    private java.time.LocalDateTime subscribedAt;

}
