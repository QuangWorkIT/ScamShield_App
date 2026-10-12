package com.be.scamshield.dto.response;

import com.be.scamshield.constant.ScamDashboardPeriod;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ScamDashboardSummaryResponse(
        String timezone,
        LocalDateTime generatedAt,
        AppliedFilters filters,
        DateRange dateRange,
        DateRange previousDateRange,
        ReportSummary reports,
        VerifiedSummary verifiedHighRisk,
        CoverageSummary coverage,
        @Schema(description = "Số danh mục lừa đảo đã xác thực")
        ScamTypeSummary scamTypes) {

    public record AppliedFilters(ScamDashboardPeriod period, String periodLabel, String regionCode,
                                 String categoryCode, String indicatorType) {}

    @Schema(description = "Khoảng ngày bao gồm cả fromDate và toDate. Số liệu không tính bản ghi sau generatedAt.")
    public record DateRange(LocalDate fromDate, LocalDate toDate) {}

    public record ReportSummary(
            long total,
            long previousTotal,
            @Schema(description = "Tăng/giảm so với kỳ trước; null nếu kỳ trước bằng 0 và kỳ này có báo cáo")
            BigDecimal changePercent,
            @Schema(description = "API chỉ trả dữ liệu tổng hợp, không trả thông tin người báo cáo")
            boolean anonymized) {}

    @Schema(description = "Báo cáo trong kỳ có đối tượng nằm trong blacklist ACTIVE và chưa bị thu hồi tại thời điểm truy vấn")
    public record VerifiedSummary(long total, BigDecimal percentOfReports, BlacklistAdditions blacklistAdditions) {}

    @Schema(description = "Số đối tượng duy nhất được thêm vào blacklist trong kỳ (theo confirmedAt), còn ACTIVE và chưa thu hồi")
    public record BlacklistAdditions(long total, long bankAccounts, long urls) {}

    public record CoverageSummary(long reportedProvinces, int totalProvinces, BigDecimal percent,
                                  long unlocatedReports, List<Hotspot> hotspots, BigDecimal hotspotsPercent) {}

    public record Hotspot(String regionCode, String regionName, long reports, BigDecimal percentOfReports) {}

    @Schema(title = "Số danh mục lừa đảo đã xác thực",
            description = "Đếm các danh mục khác nhau của đối tượng được xác thực trong kỳ (theo confirmedAt), "
                    + "còn ACTIVE và chưa bị thu hồi, áp dụng các bộ lọc đã chọn. Không đo sự kiện ngăn chặn thực tế.")
    public record ScamTypeSummary(
            @Schema(description = "Tổng số danh mục lừa đảo khác nhau đã xác thực")
            long total,
            @Schema(description = "Danh sách danh mục và số đối tượng duy nhất đã xác thực trong mỗi danh mục")
            List<ConfirmedCategory> categories) {}

    public record ConfirmedCategory(String code, String name, long confirmedIndicators) {}
}
