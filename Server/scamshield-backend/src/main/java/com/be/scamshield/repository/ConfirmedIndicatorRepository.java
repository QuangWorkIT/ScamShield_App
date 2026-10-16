package com.be.scamshield.repository;

import com.be.scamshield.entity.ConfirmedIndicator;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;

public interface ConfirmedIndicatorRepository extends JpaRepository<ConfirmedIndicator, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT c FROM ConfirmedIndicator c JOIN FETCH c.indicator i
            WHERE i.type IN :types AND i.normalizedValue IN :values
            ORDER BY c.id
            """)
    List<ConfirmedIndicator> findForDispute(Collection<String> types, Collection<String> values);
}
