package com.be.scamshield.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationItemResponse {
    private Long id;
    private String title;
    private String desc;
    private String message;
    private String time;
    private LocalDateTime createdAt;
    private boolean unread;
    private boolean isRead;
    private String type;
    private String referenceType;
    private Long referenceId;
    private String dotColor;
    private String icon;
    private String iconBg;
    private String iconColor;
}
