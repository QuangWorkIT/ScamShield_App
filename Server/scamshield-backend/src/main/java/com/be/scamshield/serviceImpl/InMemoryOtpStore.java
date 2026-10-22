package com.be.scamshield.serviceImpl;

import com.be.scamshield.constant.OtpType;
import com.be.scamshield.dto.OtpEntry;
import com.be.scamshield.service.IOtpStore;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Profile("test")
public class InMemoryOtpStore implements IOtpStore {

    private final ConcurrentHashMap<String, OtpEntry> entries = new ConcurrentHashMap<>();
    private final List<LocalDateTime> phoneRequests = new CopyOnWriteArrayList<>();

    private String key(OtpType type, String target) {
        return type.name() + ":" + target;
    }

    @Override
    public Optional<OtpEntry> findLatest(String target, OtpType type) {
        OtpEntry entry = entries.get(key(type, target));
        if (entry == null) {
            return Optional.empty();
        }
        return Optional.of(copy(entry));
    }

    @Override
    public void save(OtpEntry entry, Duration ttl) {
        entries.put(key(entry.getType(), entry.getTarget()), copy(entry));
    }

    @Override
    public void markVerified(String target, OtpType type) {
        entries.computeIfPresent(key(type, target), (k, existing) -> {
            existing.setVerified(true);
            if (type == OtpType.PHONE) {
                existing.setProviderSessionInfo(null);
            }
            return existing;
        });
    }

    @Override
    public void incrementFailedAttempts(String target, OtpType type) {
        entries.computeIfPresent(key(type, target), (k, existing) -> {
            existing.setFailedAttempts(existing.getFailedAttempts() + 1);
            return existing;
        });
    }

    @Override
    public void recordPhoneOtpRequest(LocalDateTime timestamp) {
        phoneRequests.add(timestamp);
    }

    @Override
    public long countPhoneOtpRequestsSince(LocalDateTime since) {
        return phoneRequests.stream()
                .filter(t -> t != null && t.isAfter(since))
                .count();
    }

    @Override
    public void clear() {
        entries.clear();
        phoneRequests.clear();
    }

    private OtpEntry copy(OtpEntry original) {
        return OtpEntry.builder()
                .target(original.getTarget())
                .type(original.getType())
                .otpCode(original.getOtpCode())
                .provider(original.getProvider())
                .providerSessionInfo(original.getProviderSessionInfo())
                .createdAt(original.getCreatedAt())
                .expiresAt(original.getExpiresAt())
                .isVerified(original.isVerified())
                .failedAttempts(original.getFailedAttempts())
                .build();
    }
}
