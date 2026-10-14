package com.be.scamshield.service;

import com.be.scamshield.dto.response.NotificationListResponse;
import com.be.scamshield.dto.response.NotificationTabCountsResponse;
import org.springframework.data.domain.Pageable;

public interface INotificationService {

    NotificationListResponse getNotifications(Long userId, String type, Boolean unreadOnly, Pageable pageable);

    NotificationTabCountsResponse getTabCounts(Long userId);

    long getUnreadCount(Long userId);

    void markAllAsRead(Long userId);

    void markAsRead(Long userId, Long notificationId);
}
