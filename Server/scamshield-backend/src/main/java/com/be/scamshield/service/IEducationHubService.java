package com.be.scamshield.service;

import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.request.EducationContentFilterRequest;
import com.be.scamshield.dto.request.EducationHubFilterRequest;
import com.be.scamshield.dto.response.EducationContentResponse;
import com.be.scamshield.dto.response.EducationFiltersResponse;
import com.be.scamshield.dto.response.EducationHubResponse;

public interface IEducationHubService {
    EducationHubResponse getHub(EducationHubFilterRequest filter);
    PaginatedResponse<EducationContentResponse> getContents(EducationContentFilterRequest filter);
    EducationContentResponse getContent(String slug);
    EducationFiltersResponse getFilters();
}
