package com.be.scamshield.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ContactVerificationResponse {
    private final String verificationToken;
    private final LocalDateTime expiresAt;
}
