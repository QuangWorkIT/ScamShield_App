package com.be.scamshield.dto.response;

import com.be.scamshield.constant.EducationContentType;

import java.util.List;

public record EducationFiltersResponse(List<EducationContentType> contentTypes,
                                       List<EducationContentResponse.Category> categories) {}
