package com.be.scamshield.controller;

import com.be.scamshield.dto.BaseResponse;
import com.be.scamshield.dto.request.ScamDashboardFilterRequest;
import com.be.scamshield.dto.response.ScamDashboardFiltersResponse;
import com.be.scamshield.dto.response.ScamDashboardSummaryResponse;
import com.be.scamshield.service.IScamDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@SecurityRequirements
@Tag(name = "ScamDashboard", description = "ScamDashboard tổng hợp lừa đảo; công khai, không chứa thông tin người báo cáo")
public class ScamDashboardController {
    private final IScamDashboardService scamDashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Lấy các chỉ số dashboard tổng hợp", description = "Mặc định 30 ngày qua theo giờ Việt Nam. "
            + "Hỗ trợ hôm nay, 7/30 ngày, quý, năm và khoảng ngày tùy chọn; kết hợp tỉnh/thành, danh mục và loại đối tượng. "
            + "Báo cáo tính theo createdAt; blacklist và danh mục xác thực tính theo confirmedAt. "
            + "Xác thực dựa trên blacklist ACTIVE chưa thu hồi tại thời điểm truy vấn. "
            + "Danh mục ưu tiên phân loại đã xác thực, sau đó phân loại của báo cáo. "
            + "Tăng trưởng so với kỳ lịch liền trước (kỳ hiện tại có thể chưa kết thúc); null nếu kỳ trước bằng 0. "
            + "scamTypes: Số danh mục lừa đảo đã xác thực. Đếm các danh mục khác nhau của đối tượng được xác thực "
            + "trong kỳ theo confirmedAt, còn ACTIVE và chưa thu hồi, áp dụng các bộ lọc đã chọn; không đo sự kiện ngăn chặn thực tế.")
    public ResponseEntity<BaseResponse<ScamDashboardSummaryResponse>> getSummary(
            @Valid @ModelAttribute @ParameterObject ScamDashboardFilterRequest filter) {
        return ResponseEntity.ok(new BaseResponse<>(true, "Lấy dashboard tổng hợp thành công", scamDashboardService.getSummary(filter)));
    }

    @GetMapping("/filters")
    @Operation(summary = "Lấy danh sách bộ lọc dashboard", description = "Các khoảng thời gian, 34 tỉnh/thành, "
            + "danh mục và loại đối tượng trong database. Bỏ regionCode để chọn toàn quốc. "
            + "Dùng danh mục hiện tại để thống kê; mã tỉnh cũ hoặc dữ liệu thiếu mã tỉnh được tính vào unlocatedReports.")
    public ResponseEntity<BaseResponse<ScamDashboardFiltersResponse>> getFilters() {
        return ResponseEntity.ok(new BaseResponse<>(true, "Lấy bộ lọc dashboard thành công", scamDashboardService.getFilters()));
    }
}
