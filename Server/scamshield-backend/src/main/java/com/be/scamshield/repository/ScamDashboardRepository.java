package com.be.scamshield.repository;

import com.be.scamshield.dto.request.ScamDashboardFilterRequest;
import com.be.scamshield.dto.response.ScamDashboardFiltersResponse.CategoryOption;
import com.be.scamshield.dto.response.ScamDashboardSummaryResponse.BlacklistAdditions;
import com.be.scamshield.dto.response.ScamDashboardSummaryResponse.ConfirmedCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class ScamDashboardRepository {
    private final NamedParameterJdbcTemplate jdbc;

    private static final String REPORT_FROM = """
            FROM reports r
            JOIN indicators i ON i.id = r.indicator_id
            LEFT JOIN confirmed_indicators ci ON ci.indicator_id = i.id
                AND ci.status = 'ACTIVE' AND ci.retracted_at IS NULL AND ci.confirmed_at <= :asOf
            LEFT JOIN scam_categories c ON c.id = COALESCE(ci.category_id, r.category_id)
            WHERE r.created_at >= :from AND r.created_at < :to AND r.created_at <= :asOf
            """;

    private static final String CONFIRMED_FROM = """
            FROM confirmed_indicators ci
            JOIN indicators i ON i.id = ci.indicator_id
            LEFT JOIN reports sr ON sr.id = ci.source_report_id
            LEFT JOIN scam_categories c ON c.id = COALESCE(ci.category_id, sr.category_id)
            WHERE ci.status = 'ACTIVE' AND ci.retracted_at IS NULL
                AND ci.confirmed_at >= :from AND ci.confirmed_at < :to AND ci.confirmed_at <= :asOf
            """;

    public record ReportTotals(long total, long verified) {}
    public record RegionCount(String code, long reports) {}

    public ReportTotals getReportTotals(ScamDashboardFilterRequest filter, LocalDateTime from,
                                        LocalDateTime to, LocalDateTime asOf) {
        String sql = """
                SELECT COUNT(*) AS total,
                    COALESCE(SUM(CASE WHEN ci.id IS NOT NULL THEN 1 ELSE 0 END), 0) AS verified
                """ + REPORT_FROM + reportFilters(filter);
        return jdbc.queryForObject(sql, parameters(filter, from, to, asOf),
                (rs, row) -> new ReportTotals(rs.getLong("total"), rs.getLong("verified")));
    }

    public List<RegionCount> getRegionCounts(ScamDashboardFilterRequest filter, LocalDateTime from,
                                             LocalDateTime to, LocalDateTime asOf) {
        return jdbc.query("SELECT r.region_code, COUNT(*) AS total " + REPORT_FROM + reportFilters(filter)
                        + " GROUP BY r.region_code ORDER BY total DESC, r.region_code ASC",
                parameters(filter, from, to, asOf),
                (rs, row) -> new RegionCount(rs.getString("region_code"), rs.getLong("total")));
    }

    public BlacklistAdditions getBlacklistAdditions(ScamDashboardFilterRequest filter, LocalDateTime from,
                                                    LocalDateTime to, LocalDateTime asOf) {
        String sql = """
                SELECT COUNT(*) AS total,
                    COALESCE(SUM(CASE WHEN i.type = 'BANK_ACCOUNT' THEN 1 ELSE 0 END), 0) AS bank_accounts,
                    COALESCE(SUM(CASE WHEN i.type = 'URL' THEN 1 ELSE 0 END), 0) AS urls
                """ + CONFIRMED_FROM + confirmedFilters(filter) + " AND i.type IN ('BANK_ACCOUNT', 'URL')";
        return jdbc.queryForObject(sql, parameters(filter, from, to, asOf),
                (rs, row) -> new BlacklistAdditions(rs.getLong("total"), rs.getLong("bank_accounts"), rs.getLong("urls")));
    }

    public List<ConfirmedCategory> getConfirmedCategories(ScamDashboardFilterRequest filter, LocalDateTime from,
                                                          LocalDateTime to, LocalDateTime asOf) {
        return jdbc.query("SELECT c.code, c.name, COUNT(*) AS total " + CONFIRMED_FROM + confirmedFilters(filter)
                        + " AND c.id IS NOT NULL GROUP BY c.code, c.name ORDER BY total DESC, c.code ASC",
                parameters(filter, from, to, asOf),
                (rs, row) -> new ConfirmedCategory(rs.getString("code"), rs.getString("name"), rs.getLong("total")));
    }

    public List<CategoryOption> getCategoryOptions() {
        return jdbc.query("SELECT code, name, is_active FROM scam_categories ORDER BY code",
                (rs, row) -> new CategoryOption(rs.getString("code"), rs.getString("name"), rs.getBoolean("is_active")));
    }

    public List<String> getIndicatorTypeOptions() {
        return jdbc.query("SELECT DISTINCT type FROM indicators ORDER BY type", (rs, row) -> rs.getString("type"));
    }

    private String reportFilters(ScamDashboardFilterRequest filter) {
        return commonFilters(filter) + (filter.getRegionCode() == null ? "" : " AND r.region_code = :regionCode");
    }

    private String confirmedFilters(ScamDashboardFilterRequest filter) {
        // EXISTS avoids counting the same confirmed indicator repeatedly when it has multiple reports.
        return commonFilters(filter) + (filter.getRegionCode() == null ? "" : """
                 AND EXISTS (SELECT 1 FROM reports rr
                     WHERE rr.indicator_id = ci.indicator_id AND rr.region_code = :regionCode AND rr.created_at <= :asOf)
                """);
    }

    private String commonFilters(ScamDashboardFilterRequest filter) {
        return (filter.getCategoryCode() == null ? "" : " AND c.code = :categoryCode")
                + (filter.getIndicatorType() == null ? "" : " AND i.type = :indicatorType");
    }

    private MapSqlParameterSource parameters(ScamDashboardFilterRequest filter, LocalDateTime from,
                                             LocalDateTime to, LocalDateTime asOf) {
        return new MapSqlParameterSource("from", from).addValue("to", to).addValue("asOf", asOf)
                .addValue("regionCode", filter.getRegionCode()).addValue("categoryCode", filter.getCategoryCode())
                .addValue("indicatorType", filter.getIndicatorType());
    }
}
