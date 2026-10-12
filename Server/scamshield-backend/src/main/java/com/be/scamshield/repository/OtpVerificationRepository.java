package com.be.scamshield.repository;

import com.be.scamshield.constant.OtpType;
import com.be.scamshield.entity.OtpVerification;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    long countByTypeAndCreatedAtAfter(OtpType type, LocalDateTime since);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<OtpVerification> findTopByTargetAndTypeOrderByIdDesc(String target, OtpType type);
}
