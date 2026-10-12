package com.be.scamshield.entity;

import com.be.scamshield.constant.OtpType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications", indexes = {
        @Index(name = "idx_otp_type_created_at", columnList = "type,created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "target", nullable = false)
    private String target; // This could be email or phone number

    @Column(name = "otp_code")
    @ToString.Exclude
    private String otpCode;

    @Column(name = "provider", length = 20)
    private String provider;

    @Column(name = "provider_session_info", columnDefinition = "text")
    @ToString.Exclude
    private String providerSessionInfo;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private OtpType type;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "is_verified", nullable = false)
    private boolean isVerified;

    @Column(name = "failed_attempts", nullable = false)
    @Builder.Default
    private int failedAttempts = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
