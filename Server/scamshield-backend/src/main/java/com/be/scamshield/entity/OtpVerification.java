package com.be.scamshield.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications")
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

    @Column(name = "otp_code", nullable = false)
    private String otpCode;

    @Column(name = "type", nullable = false)
    private String type; // EMAIL or PHONE

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "is_verified", nullable = false)
    private boolean isVerified;
}
