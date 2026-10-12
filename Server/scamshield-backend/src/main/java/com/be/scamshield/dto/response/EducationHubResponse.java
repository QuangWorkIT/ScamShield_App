package com.be.scamshield.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record EducationHubResponse(String timezone, LocalDateTime generatedAt,
                                   EducationFiltersResponse filters,
                                   List<EducationContentResponse> scenarios, long totalScenarios,
                                   List<EducationContentResponse> pocketCards, long totalPocketCards) {}
