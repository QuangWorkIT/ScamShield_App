package com.be.scamshield.repository;

import com.be.scamshield.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findByTargetAndOtpCodeAndType(String target, String otpCode, String type);
    Optional<OtpVerification> findTopByTargetAndTypeOrderByIdDesc(String target, String type);
}
