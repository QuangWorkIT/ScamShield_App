package com.be.scamshield.serviceImpl;

import com.be.scamshield.entity.User;
import com.be.scamshield.entity.UserAlertSubscription;
import com.be.scamshield.repository.UserAlertSubscriptionRepository;
import com.be.scamshield.service.IUserAlertSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Clock;

@Service
@RequiredArgsConstructor
public class UserAlertSubscriptionServiceImpl implements IUserAlertSubscriptionService {

    private final Clock applicationClock;
    private final UserAlertSubscriptionRepository subscriptionRepository;

    @Override
    public void subscribeAllCategories(User user) {
        // Tạm thời set category = null để đại diện cho "Nhận tất cả cảnh báo khẩn cấp chung"
        // Hoặc bạn có thể query ScamCategorieRepository để lấy list rồi saveAll()
        
        UserAlertSubscription subscription = UserAlertSubscription.builder()
                .user(user)
                .category(null) // null = ALL categories / general
                .regionCode("VN") // Mặc định Việt Nam
                .subscribedAt(LocalDateTime.now(applicationClock))
                .build();
                
        subscriptionRepository.save(subscription);
    }
}
