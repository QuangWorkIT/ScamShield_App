package com.be.scamshield.serviceImpl;

import com.be.scamshield.constant.OtpType;
import com.be.scamshield.config.FirebasePhoneProperties;
import com.be.scamshield.entity.OtpVerification;
import com.be.scamshield.exception.OtpRateLimitException;
import com.be.scamshield.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SmsOtpReservationService {
    private final OtpVerificationRepository otpRepository;
    private final FirebasePhoneProperties properties;
    private final Clock applicationClock;
    private final PlatformTransactionManager transactionManager;

    @Value("${app.otp.phone-expiration-ms}")
    private long phoneOtpExpirationMs;

    @PostConstruct
    void validateExpiration() {
        if (phoneOtpExpirationMs <= 0) {
            throw new IllegalArgumentException("Thời gian hết hạn OTP điện thoại phải lớn hơn 0 ms");
        }
    }

    // Commit before the external call: errors/timeouts must not refund a potentially sent SMS.
    public synchronized OtpVerification reserve(String nationalPhone) {
        TransactionTemplate transaction = new TransactionTemplate(transactionManager);
        transaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        transaction.setIsolationLevel(TransactionDefinition.ISOLATION_SERIALIZABLE);
        // The monitor covers commit too; PostgreSQL SERIALIZABLE also protects across app instances.
        return transaction.execute(status -> reserveInTransaction(nationalPhone));
    }

    private OtpVerification reserveInTransaction(String nationalPhone) {
        LocalDateTime now = LocalDateTime.now(applicationClock);
        if (otpRepository.countByTypeAndCreatedAtAfter(OtpType.PHONE, now.minusHours(24))
                >= properties.getMaxRequestsPer24Hours()) {
            throw new OtpRateLimitException("Đã đạt giới hạn gửi OTP SMS của dự án trong 24 giờ; vui lòng thử lại sau");
        }
        otpRepository.findTopByTargetAndTypeOrderByIdDesc(nationalPhone, OtpType.PHONE).ifPresent(latest -> {
            if (latest.getCreatedAt().plusSeconds(60).isAfter(now)) {
                throw new OtpRateLimitException("Vui lòng đợi 60 giây trước khi yêu cầu OTP SMS mới");
            }
        });
        return otpRepository.saveAndFlush(OtpVerification.builder()
                .target(nationalPhone).type(OtpType.PHONE).provider("FIREBASE")
                .createdAt(now).expiresAt(now.plus(Duration.ofMillis(phoneOtpExpirationMs))).isVerified(false).failedAttempts(0).build());
    }
}
