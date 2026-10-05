package com.be.scamshield.repository;

import com.be.scamshield.entity.UserAlertSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAlertSubscriptionRepository extends JpaRepository<UserAlertSubscription, Long> {
}
