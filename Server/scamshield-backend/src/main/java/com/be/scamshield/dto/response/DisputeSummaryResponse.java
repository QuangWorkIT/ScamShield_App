package com.be.scamshield.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "Thống kê toàn bộ hồ sơ khiếu nại của người dùng đang đăng nhập, "
        + "độc lập với bộ lọc và phân trang của API danh sách")
public record DisputeSummaryResponse(
        @Schema(example = "Asia/Ho_Chi_Minh")
        String timezone,
        LocalDateTime generatedAt,
        long totalSubmitted,
        long pending,
        long inReview,
        long needsMoreInfo,
        long approved,
        long rejected,
        @Schema(description = "Số giờ trung bình từ createdAt đến resolvedAt của hồ sơ APPROVED/REJECTED. "
                + "Chỉ tính resolvedAt không ở tương lai và không trước createdAt; null khi chưa có mẫu hợp lệ")
        BigDecimal averageResolutionHours,
        @Schema(description = "Tỷ lệ phần trăm approved / (approved + rejected) × 100; null khi chưa có hồ sơ đã giải quyết. "
                + "Phản ánh trạng thái trong ScamShield, không xác nhận việc gỡ trên các hệ thống bên ngoài")
        BigDecimal restorationRate
) {
}
