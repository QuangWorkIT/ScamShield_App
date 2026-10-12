package com.be.scamshield.serviceImpl;

import com.be.scamshield.constant.ScamDashboardPeriod;
import com.be.scamshield.dto.request.ScamDashboardFilterRequest;
import com.be.scamshield.dto.response.ScamDashboardSummaryResponse.BlacklistAdditions;
import com.be.scamshield.dto.response.ScamDashboardSummaryResponse.DateRange;
import com.be.scamshield.exception.BadRequestException;
import com.be.scamshield.repository.ScamDashboardRepository;
import com.be.scamshield.repository.ScamDashboardRepository.ReportTotals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class ScamDashboardServiceImplTest {
    private ScamDashboardRepository repository;
    private ScamDashboardServiceImpl service;

    @BeforeEach
    void setUp() {
        repository = mock(ScamDashboardRepository.class);
        service = new ScamDashboardServiceImpl(repository, Clock.fixed(Instant.parse("2026-10-08T18:00:00Z"), ZoneOffset.UTC));
        when(repository.getReportTotals(any(), any(), any(), any())).thenReturn(new ReportTotals(0, 0));
        when(repository.getRegionCounts(any(), any(), any(), any())).thenReturn(List.of());
        when(repository.getConfirmedCategories(any(), any(), any(), any())).thenReturn(List.of());
        when(repository.getBlacklistAdditions(any(), any(), any(), any())).thenReturn(new BlacklistAdditions(0, 0, 0));
    }

    @Test
    void defaultsToThirtyCalendarDaysInVietnamAndTheImmediatelyPreviousThirtyDays() {
        var response = service.getSummary(new ScamDashboardFilterRequest());
        assertThat(response.dateRange()).isEqualTo(range("2026-09-10", "2026-10-09"));
        assertThat(response.previousDateRange()).isEqualTo(range("2026-08-11", "2026-09-09"));
        assertThat(response.generatedAt()).isEqualTo(LocalDateTime.parse("2026-10-09T01:00:00"));
        assertThat(response.timezone()).isEqualTo("Asia/Ho_Chi_Minh");
    }

    @Test
    void todayUsesVietnamDateRatherThanUtcDate() {
        ScamDashboardFilterRequest filter = filter(ScamDashboardPeriod.TODAY);
        var response = service.getSummary(filter);
        assertThat(response.dateRange()).isEqualTo(range("2026-10-09", "2026-10-09"));
        assertThat(response.previousDateRange()).isEqualTo(range("2026-10-08", "2026-10-08"));
    }

    @Test
    void sevenDaysIncludesTodayAndSixPreviousDays() {
        var response = service.getSummary(filter(ScamDashboardPeriod.LAST_7_DAYS));
        assertThat(response.dateRange()).isEqualTo(range("2026-10-03", "2026-10-09"));
        assertThat(response.previousDateRange()).isEqualTo(range("2026-09-26", "2026-10-02"));
    }

    @Test
    void firstQuarterComparesAgainstFourthQuarterOfPreviousYear() {
        ScamDashboardFilterRequest filter = filter(ScamDashboardPeriod.QUARTER);
        filter.setYear(2025);
        filter.setQuarter(1);
        var response = service.getSummary(filter);
        assertThat(response.dateRange()).isEqualTo(range("2025-01-01", "2025-03-31"));
        assertThat(response.previousDateRange()).isEqualTo(range("2024-10-01", "2024-12-31"));
        assertThat(response.filters().periodLabel()).isEqualTo("Quý 1/2025");
    }

    @Test
    void leapYearComparesToThePreviousCalendarYear() {
        ScamDashboardFilterRequest filter = filter(ScamDashboardPeriod.YEAR);
        filter.setYear(2024);
        var response = service.getSummary(filter);
        assertThat(response.dateRange()).isEqualTo(range("2024-01-01", "2024-12-31"));
        assertThat(response.previousDateRange()).isEqualTo(range("2023-01-01", "2023-12-31"));
    }

    @Test
    void customIncludesTheLastDateAndComparesToAnEqualLengthPeriod() {
        ScamDashboardFilterRequest filter = filter(ScamDashboardPeriod.CUSTOM);
        filter.setFromDate(LocalDate.parse("2024-02-01"));
        filter.setToDate(LocalDate.parse("2024-02-29"));
        var response = service.getSummary(filter);
        assertThat(response.dateRange()).isEqualTo(range("2024-02-01", "2024-02-29"));
        assertThat(response.previousDateRange()).isEqualTo(range("2024-01-03", "2024-01-31"));
    }

    @ParameterizedTest
    @EnumSource(value = ScamDashboardPeriod.class, names = {"QUARTER", "YEAR", "CUSTOM"})
    void rejectsIncompleteCalendarFiltersBeforeQuerying(ScamDashboardPeriod period) {
        assertThatThrownBy(() -> service.getSummary(filter(period))).isInstanceOf(BadRequestException.class);
        verifyNoInteractions(repository);
    }

    @Test
    void rejectsAmbiguousFiltersAndUnknownProvince() {
        ScamDashboardFilterRequest filter = new ScamDashboardFilterRequest();
        filter.setYear(2025);
        assertThatThrownBy(() -> service.getSummary(filter)).isInstanceOf(BadRequestException.class).hasMessageContaining("year");
        filter.setYear(null);
        filter.setQuarter(2);
        assertThatThrownBy(() -> service.getSummary(filter)).isInstanceOf(BadRequestException.class).hasMessageContaining("quarter");
        filter.setQuarter(null);
        filter.setFromDate(LocalDate.parse("2026-10-01"));
        assertThatThrownBy(() -> service.getSummary(filter)).isInstanceOf(BadRequestException.class).hasMessageContaining("CUSTOM");
        filter.setFromDate(null);
        filter.setRegionCode("99");
        assertThatThrownBy(() -> service.getSummary(filter)).isInstanceOf(BadRequestException.class).hasMessageContaining("Mã tỉnh");
        verifyNoInteractions(repository);
    }

    @Test
    void rejectsReversedAndExcessiveCustomRanges() {
        ScamDashboardFilterRequest filter = filter(ScamDashboardPeriod.CUSTOM);
        filter.setFromDate(LocalDate.parse("2026-10-09"));
        filter.setToDate(LocalDate.parse("2026-10-08"));
        assertThatThrownBy(() -> service.getSummary(filter)).isInstanceOf(BadRequestException.class);
        filter.setFromDate(LocalDate.parse("2024-01-01"));
        filter.setToDate(LocalDate.parse("2025-01-01"));
        assertThatThrownBy(() -> service.getSummary(filter)).isInstanceOf(BadRequestException.class);
        verifyNoInteractions(repository);
    }

    @Test
    void returnsNullGrowthWhenPreviousPeriodIsEmptyAndZeroWhenBothAreEmpty() {
        when(repository.getReportTotals(any(), any(), any(), any()))
                .thenReturn(new ReportTotals(2, 1), new ReportTotals(0, 0), new ReportTotals(0, 0));
        var response = service.getSummary(new ScamDashboardFilterRequest());
        assertThat(response.reports().changePercent()).isNull();
        assertThat(response.verifiedHighRisk().percentOfReports()).isEqualByComparingTo("50.0");
        assertThat(service.getSummary(new ScamDashboardFilterRequest()).reports().changePercent()).isEqualByComparingTo("0.0");
    }

    private ScamDashboardFilterRequest filter(ScamDashboardPeriod period) {
        ScamDashboardFilterRequest filter = new ScamDashboardFilterRequest();
        filter.setPeriod(period);
        return filter;
    }

    private DateRange range(String start, String end) {
        return new DateRange(LocalDate.parse(start), LocalDate.parse(end));
    }
}
