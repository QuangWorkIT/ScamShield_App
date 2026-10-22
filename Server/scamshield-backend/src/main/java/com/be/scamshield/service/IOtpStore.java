package com.be.scamshield.service;

import com.be.scamshield.constant.OtpType;
import com.be.scamshield.dto.OtpEntry;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

public interface IOtpStore {

    Optional<OtpEntry> findLatest(String target, OtpType type);

    void save(OtpEntry entry, Duration ttl);

    void markVerified(String target, OtpType type);

    void incrementFailedAttempts(String target, OtpType type);

    void recordPhoneOtpRequest(LocalDateTime timestamp);

    long countPhoneOtpRequestsSince(LocalDateTime since);

    void clear();
}
