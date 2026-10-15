package com.be.scamshield.repository;

import com.be.scamshield.entity.ReputationRank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReputationRankRepository extends JpaRepository<ReputationRank, Long> {

    @Query("SELECT r FROM ReputationRank r WHERE r.minPoints <= :points AND (r.maxPoints IS NULL OR r.maxPoints >= :points) ORDER BY r.minPoints DESC LIMIT 1")
    Optional<ReputationRank> findRankByPoints(@Param("points") Integer points);
}
