package com.be.scamshield.service;

import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.request.ModeratorReportFilterRequest;
import com.be.scamshield.dto.response.ModeratorQueueCountsResponse;
import com.be.scamshield.dto.response.ModeratorReportResponse;
import org.springframework.data.domain.Pageable;

public interface IModeratorReportService {

    PaginatedResponse<ModeratorReportResponse> getReportQueue(
            ModeratorReportFilterRequest filter,
            Pageable pageable
    );

    ModeratorQueueCountsResponse getQueueCounts();

    ModeratorReportResponse getReportById(Long id);
}

