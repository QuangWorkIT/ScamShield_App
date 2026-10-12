package com.be.scamshield.serviceImpl;

import com.be.scamshield.constant.ScamDashboardPeriod;
import com.be.scamshield.constant.VietnamProvince;
import com.be.scamshield.dto.request.ScamDashboardFilterRequest;
import com.be.scamshield.dto.response.ScamDashboardFiltersResponse;
import com.be.scamshield.dto.response.ScamDashboardFiltersResponse.PeriodOption;
import com.be.scamshield.dto.response.ScamDashboardFiltersResponse.RegionOption;
import com.be.scamshield.dto.response.ScamDashboardSummaryResponse;
import com.be.scamshield.dto.response.ScamDashboardSummaryResponse.AppliedFilters;
import com.be.scamshield.dto.response.ScamDashboardSummaryResponse.CoverageSummary;
import com.be.scamshield.dto.response.ScamDashboardSummaryResponse.DateRange;
import com.be.scamshield.dto.response.ScamDashboardSummaryResponse.Hotspot;
import com.be.scamshield.dto.response.ScamDashboardSummaryResponse.ReportSummary;
import com.be.scamshield.dto.response.ScamDashboardSummaryResponse.ScamTypeSummary;
import com.be.scamshield.dto.response.ScamDashboardSummaryResponse.VerifiedSummary;
import com.be.scamshield.exception.BadRequestException;
import com.be.scamshield.repository.ScamDashboardRepository;
import com.be.scamshield.service.IScamDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
public class ScamDashboardServiceImpl implements IScamDashboardService {
    private static final String TIMEZONE = "Asia/Ho_Chi_Minh";
    private final ScamDashboardRepository repository;
    private final Clock clock;

    @Override
    public ScamDashboardSummaryResponse getSummary(ScamDashboardFilterRequest filter) {
        LocalDateTime now = LocalDateTime.now(clock.withZone(ZoneId.of(TIMEZONE)));
        validateFilters(filter);
        DateRange range = resolveRange(filter, now.toLocalDate());
        DateRange previous = previousRange(filter.getPeriod(), range);
        LocalDateTime from = range.fromDate().atStartOfDay();
        LocalDateTime to = range.toDate().plusDays(1).atStartOfDay();

        var totals = repository.getReportTotals(filter, from, to, now);
        var previousTotals = repository.getReportTotals(filter, previous.fromDate().atStartOfDay(),
                previous.toDate().plusDays(1).atStartOfDay(), now);
        var regions = repository.getRegionCounts(filter, from, to, now).stream()
                .filter(region -> VietnamProvince.fromCode(region.code()).isPresent()).toList();
        long locatedReports = regions.stream().mapToLong(ScamDashboardRepository.RegionCount::reports).sum();
        List<Hotspot> hotspots = regions.stream().limit(2).map(region -> new Hotspot(region.code(),
                VietnamProvince.fromCode(region.code()).orElseThrow().getName(), region.reports(),
                percent(region.reports(), totals.total()))).toList();
        int totalProvinces = filter.getRegionCode() == null ? VietnamProvince.values().length : 1;
        var categories = repository.getConfirmedCategories(filter, from, to, now);

        return new ScamDashboardSummaryResponse(TIMEZONE, now,
                new AppliedFilters(filter.getPeriod(), periodLabel(filter, range), filter.getRegionCode(),
                        filter.getCategoryCode(), filter.getIndicatorType()), range, previous,
                new ReportSummary(totals.total(), previousTotals.total(),
                        changePercent(totals.total(), previousTotals.total()), true),
                new VerifiedSummary(totals.verified(), percent(totals.verified(), totals.total()),
                        repository.getBlacklistAdditions(filter, from, to, now)),
                new CoverageSummary(regions.size(), totalProvinces, percent(regions.size(), totalProvinces),
                        totals.total() - locatedReports, hotspots,
                        percent(hotspots.stream().mapToLong(Hotspot::reports).sum(), totals.total())),
                new ScamTypeSummary(categories.size(), categories));
    }

    @Override
    public ScamDashboardFiltersResponse getFilters() {
        LocalDate today = LocalDate.now(clock.withZone(ZoneId.of(TIMEZONE)));
        return new ScamDashboardFiltersResponse(TIMEZONE, ScamDashboardPeriod.LAST_30_DAYS,
                today.getYear(), (today.getMonthValue() - 1) / 3 + 1,
                List.of(new PeriodOption(ScamDashboardPeriod.TODAY, "Hôm nay"),
                        new PeriodOption(ScamDashboardPeriod.LAST_7_DAYS, "7 ngày qua"),
                        new PeriodOption(ScamDashboardPeriod.LAST_30_DAYS, "30 ngày qua"),
                        new PeriodOption(ScamDashboardPeriod.QUARTER, "Theo quý"),
                        new PeriodOption(ScamDashboardPeriod.YEAR, "Theo năm"),
                        new PeriodOption(ScamDashboardPeriod.CUSTOM, "Khoảng ngày tùy chọn")),
                Arrays.stream(VietnamProvince.values()).map(p -> new RegionOption(p.getCode(), p.getName())).toList(),
                repository.getCategoryOptions(), repository.getIndicatorTypeOptions());
    }

    private void validateFilters(ScamDashboardFilterRequest filter) {
        if (filter.getRegionCode() != null && VietnamProvince.fromCode(filter.getRegionCode()).isEmpty()) {
            throw new BadRequestException("Mã tỉnh/thành không hợp lệ; lấy danh sách từ /api/dashboard/filters");
        }
        ScamDashboardPeriod period = filter.getPeriod();
        if (period != ScamDashboardPeriod.QUARTER && period != ScamDashboardPeriod.YEAR && filter.getYear() != null) {
            throw new BadRequestException("year chỉ dùng với QUARTER hoặc YEAR");
        }
        if (period != ScamDashboardPeriod.QUARTER && filter.getQuarter() != null) {
            throw new BadRequestException("quarter chỉ dùng với QUARTER");
        }
        if (period != ScamDashboardPeriod.CUSTOM && (filter.getFromDate() != null || filter.getToDate() != null)) {
            throw new BadRequestException("fromDate và toDate chỉ dùng với CUSTOM");
        }
    }

    private DateRange resolveRange(ScamDashboardFilterRequest filter, LocalDate today) {
        return switch (filter.getPeriod()) {
            case TODAY -> new DateRange(today, today);
            case LAST_7_DAYS -> new DateRange(today.minusDays(6), today);
            case LAST_30_DAYS -> new DateRange(today.minusDays(29), today);
            case QUARTER -> {
                if (filter.getYear() == null || filter.getQuarter() == null) {
                    throw new BadRequestException("Vui lòng cung cấp year và quarter khi lọc theo quý");
                }
                LocalDate start = LocalDate.of(filter.getYear(), (filter.getQuarter() - 1) * 3 + 1, 1);
                yield new DateRange(start, start.plusMonths(3).minusDays(1));
            }
            case YEAR -> {
                if (filter.getYear() == null) {
                    throw new BadRequestException("Vui lòng cung cấp year khi lọc theo năm");
                }
                yield new DateRange(LocalDate.of(filter.getYear(), 1, 1), LocalDate.of(filter.getYear(), 12, 31));
            }
            case CUSTOM -> {
                LocalDate start = filter.getFromDate();
                LocalDate end = filter.getToDate();
                if (start == null || end == null) {
                    throw new BadRequestException("Vui lòng cung cấp fromDate và toDate");
                }
                if (start.isAfter(end) || ChronoUnit.DAYS.between(start, end) >= 366
                        || start.getYear() < 2000 || end.getYear() > 9998) {
                    throw new BadRequestException("Khoảng ngày phải tăng dần, tối đa 366 ngày và nằm trong năm 2000–9998");
                }
                yield new DateRange(start, end);
            }
        };
    }

    private DateRange previousRange(ScamDashboardPeriod period, DateRange range) {
        if (period == ScamDashboardPeriod.QUARTER) {
            return new DateRange(range.fromDate().minusMonths(3), range.fromDate().minusDays(1));
        }
        if (period == ScamDashboardPeriod.YEAR) {
            return new DateRange(range.fromDate().minusYears(1), range.fromDate().minusDays(1));
        }
        long days = ChronoUnit.DAYS.between(range.fromDate(), range.toDate()) + 1;
        return new DateRange(range.fromDate().minusDays(days), range.fromDate().minusDays(1));
    }

    private String periodLabel(ScamDashboardFilterRequest filter, DateRange range) {
        return switch (filter.getPeriod()) {
            case TODAY -> "Hôm nay";
            case LAST_7_DAYS -> "Chu kỳ 7 ngày";
            case LAST_30_DAYS -> "Chu kỳ 30 ngày";
            case QUARTER -> "Quý " + filter.getQuarter() + "/" + filter.getYear();
            case YEAR -> "Năm " + filter.getYear();
            case CUSTOM -> range.fromDate() + " – " + range.toDate();
        };
    }

    private BigDecimal percent(long value, long total) {
        return total == 0 ? BigDecimal.ZERO.setScale(1)
                : BigDecimal.valueOf(value).multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(total), 1, RoundingMode.HALF_UP);
    }

    private BigDecimal changePercent(long current, long previous) {
        return previous == 0 ? (current == 0 ? BigDecimal.ZERO.setScale(1) : null) : percent(current - previous, previous);
    }
}
