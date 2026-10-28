package com.be.scamshield.service;

import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.request.ModeratorAbuseEscalationFilterRequest;
import com.be.scamshield.dto.response.ModeratorAbuseEscalationResponse;

public interface IModeratorAbuseEscalationService {
    PaginatedResponse<ModeratorAbuseEscalationResponse> getEscalations(
            Long userId, ModeratorAbuseEscalationFilterRequest filter);
}
