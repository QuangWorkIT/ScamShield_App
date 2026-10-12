package com.be.scamshield.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "contact_verifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactVerification {
    @Id
    @Column(length = 64)
    private String tokenHash;
    // Legacy column retained to avoid a schema migration; phone-only grants leave it empty.
    @Builder.Default
    @Column(nullable = false, length = 254)
    private String email = "";
    @Column(nullable = false, length = 30)
    private String phoneNumber;
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    private LocalDateTime usedAt;
}
