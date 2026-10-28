package com.be.scamshield.service;

import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.admin.AdminAbuseEscalationFilterRequest;
import com.be.scamshield.dto.admin.AdminAbuseEscalationResponse;

public interface IAdminAbuseEscalationService {
    PaginatedResponse<AdminAbuseEscalationResponse> getEscalations(AdminAbuseEscalationFilterRequest filter);
}
