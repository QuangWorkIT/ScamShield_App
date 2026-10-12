package com.be.scamshield.entity;

import com.be.scamshield.constant.EducationContentType;
import com.be.scamshield.constant.EducationPublicationStatus;
import com.be.scamshield.entity.content.EducationStructuredContent;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "education_articles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "slug", unique = true, nullable = false)
    private String slug;

    // Nullable for existing legacy rows; the public API only selects supported content types.
    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", length = 32)
    private EducationContentType contentType;

    @Column(name = "summary", columnDefinition = "text")
    private String summary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "structured_content", columnDefinition = "jsonb")
    private EducationStructuredContent structuredContent;

    @Column(name = "tag")
    private String tag;

    @Column(name = "badge_label")
    private String badgeLabel;

    @Column(name = "image_url", length = 2048)
    private String imageUrl;

    @Column(name = "pdf_url", length = 2048)
    private String pdfUrl;

    @Column(name = "format_label")
    private String formatLabel;

    @Column(name = "image_width")
    private Integer imageWidth;

    @Column(name = "image_height")
    private Integer imageHeight;

    @Builder.Default
    @Column(name = "display_order", nullable = false, columnDefinition = "integer default 0")
    private Integer displayOrder = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ScamCategory category;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EducationPublicationStatus status = EducationPublicationStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdByUser;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (displayOrder == null) displayOrder = 0;
        if (status == null) status = EducationPublicationStatus.DRAFT;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
    }

}
