package com.be.scamshield.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "warning_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarningCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "created_by_user_id", nullable = false)
    private Long createdByUserId;

    @Column(name = "check_verdict_id", nullable = false)
    private Long checkVerdictId;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "image_hash")
    private String imageHash;

    @Column(name = "created_at", nullable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "expires_at")
    private java.time.LocalDateTime expiresAt;

}
