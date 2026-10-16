package com.be.scamshield.dto.response;

import com.be.scamshield.dto.PaginatedResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationListResponse {
    private PaginatedResponse<NotificationItemResponse> notifications;
    private NotificationTabCountsResponse tabCounts;
}
