package com.be.scamshield.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thống kê tổng quan báo cáo và độ tin cậy của người dùng")
public class ReportSummaryMetricsResponse {

    @Schema(description = "Tổng số báo cáo đã gửi", example = "18")
    private Long totalReports;

    @Schema(description = "Số báo cáo gửi trong 7 ngày qua", example = "4")
    private Long recentReports7Days;

    @Schema(description = "Số báo cáo đã được duyệt vào Blacklist", example = "14")
    private Long blacklistedCount;

    @Schema(description = "Ước tính số lượt truy vấn được bảo vệ", example = "3200")
    private Long queriesProtected;

    @Schema(description = "Tỷ lệ chính xác (%)", example = "93.3")
    private Double accuracyRate;

    @Schema(description = "Danh hiệu / Cấp bậc tin cậy", example = "A+ Chuyên Gia")
    private String rankTitle;

    @Schema(description = "Điểm uy tín tích lũy", example = "700")
    private Integer reputationPoints;

    @Schema(description = "Điểm tiến trình hiện tại của Sentinel", example = "600")
    private Integer currentTierProgress;

    @Schema(description = "Điểm tối đa của Sentinel tier hiện tại", example = "700")
    private Integer maxTierPoints;
}
