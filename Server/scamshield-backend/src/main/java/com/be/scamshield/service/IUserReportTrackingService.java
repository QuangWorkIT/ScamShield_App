package com.be.scamshield.service;

import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.response.*;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IUserReportTrackingService {

    ReportSummaryMetricsResponse getSummaryMetrics(Long userId);

    ReportStatusCountsResponse getStatusCounts(Long userId);

    PaginatedResponse<TrackingReportResponse> getTrackingReports(
            Long userId,
            String search,
            String status,
            Long categoryId,
            Integer days,
            Pageable pageable
    );

    byte[] exportTrackingReportsCsv(
            Long userId,
            String search,
            String status,
            Long categoryId,
            Integer days
    );

    ReportDetailTrackingResponse getReportDetail(Long userId, Long reportId);

    List<ScamCategoryResponse> getCategories();
}
