package com.be.scamshield.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "official_scam_warnings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfficialScamWarning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ScamCategorie category;

    @Column(name = "region_code")
    private String regionCode;

    @Column(name = "source_url")
    private String sourceUrl;

    @Column(name = "source_organization")
    private String sourceOrganization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "published_by")
    private User publishedByUser;

    @Column(name = "published_at")
    private java.time.LocalDateTime publishedAt;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private java.time.LocalDateTime createdAt;

}
