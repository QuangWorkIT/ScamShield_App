package com.be.scamshield.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "extracted_iocs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtractedIoc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "check_request_id", nullable = false)
    private CheckRequest checkRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "indicator_id", nullable = false)
    private Indicator indicator;

    @Column(name = "extraction_method", nullable = false)
    private String extractionMethod;

    @Column(name = "confidence")
    private java.math.BigDecimal confidence;

    @Column(name = "start_position")
    private Integer startPosition;

    @Column(name = "end_position")
    private Integer endPosition;

    @Column(name = "created_at", nullable = false)
    private java.time.LocalDateTime createdAt;

}
