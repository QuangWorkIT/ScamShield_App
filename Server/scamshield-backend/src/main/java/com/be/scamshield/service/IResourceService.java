package com.be.scamshield.service;

import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.request.BlacklistResourceFilterRequest;
import com.be.scamshield.dto.response.BlacklistResourceResponse;

public interface IResourceService {
    PaginatedResponse<BlacklistResourceResponse> getBlackListResources(BlacklistResourceFilterRequest filter);
}
