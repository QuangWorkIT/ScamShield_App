package com.be.scamshield.service;

import com.be.scamshield.dto.request.ScamDashboardFilterRequest;
import com.be.scamshield.dto.response.ScamDashboardFiltersResponse;
import com.be.scamshield.dto.response.ScamDashboardSummaryResponse;

public interface IScamDashboardService {
    ScamDashboardSummaryResponse getSummary(ScamDashboardFilterRequest filter);
    ScamDashboardFiltersResponse getFilters();
}
