package com.be.scamshield.dto.response;

import com.be.scamshield.constant.ScamDashboardPeriod;

import java.util.List;

public record ScamDashboardFiltersResponse(String timezone, ScamDashboardPeriod defaultPeriod,
                                       int currentYear, int currentQuarter,
                                       List<PeriodOption> periods, List<RegionOption> regions,
                                       List<CategoryOption> categories, List<String> indicatorTypes) {
    public record PeriodOption(ScamDashboardPeriod value, String label) {}
    public record RegionOption(String code, String name) {}
    public record CategoryOption(String code, String name, boolean active) {}
}
