package com.be.scamshield.repository;

import com.be.scamshield.entity.ContactVerification;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContactVerificationRepository extends JpaRepository<ContactVerification, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from ContactVerification v where v.tokenHash = :hash")
    Optional<ContactVerification> findLockedByTokenHash(@Param("hash") String hash);
}
