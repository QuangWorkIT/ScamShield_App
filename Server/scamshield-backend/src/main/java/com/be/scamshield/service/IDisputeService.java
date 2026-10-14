package com.be.scamshield.service;

import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.request.DisputeListRequest;
import com.be.scamshield.dto.response.DisputeListItemResponse;
import com.be.scamshield.dto.response.DisputeSummaryResponse;

public interface IDisputeService {
    PaginatedResponse<DisputeListItemResponse> getMyDisputes(Long userId, DisputeListRequest filter);

    DisputeSummaryResponse getMySummary(Long userId);
}
