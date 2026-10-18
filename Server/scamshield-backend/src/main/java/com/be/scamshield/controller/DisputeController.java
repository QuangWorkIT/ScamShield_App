package com.be.scamshield.controller;

import com.be.scamshield.dto.BaseResponse;
import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.request.DisputeListRequest;
import com.be.scamshield.dto.response.DisputeListItemResponse;
import com.be.scamshield.dto.response.DisputeSummaryResponse;
import com.be.scamshield.exception.UnauthorizedException;
import com.be.scamshield.security.UserPrincipal;
import com.be.scamshield.service.IDisputeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Disputes", description = "Hồ sơ khiếu nại của người dùng đang đăng nhập")
public class DisputeController {

    private final IDisputeService disputeService;

    @GetMapping("/me")
    @Operation(summary = "Lấy danh sách hồ sơ khiếu nại đã nộp của tôi", description = "Chỉ lấy hồ sơ "
            + "thuộc người dùng xác định từ JWT, không nhận userId từ client. Mặc định trang 0, 10 hồ sơ, "
            + "sắp xếp theo ngày nộp mới nhất. Lọc status bằng dấu phẩy hoặc lặp lại tham số, ví dụ "
            + "status=PENDING,IN_REVIEW,NEEDS_MORE_INFO. status=APPROVED để lấy hồ sơ đã được chấp nhận "
            + "và giải tỏa xác thực blacklist. Thời điểm trả về là giờ Việt Nam. "
            + "Trạng thái đã gỡ chỉ phản ánh dữ liệu ScamShield; API không xác nhận việc gỡ trên "
            + "hệ thống bên ngoài hoặc việc cấp TrustSeal.")
    public ResponseEntity<BaseResponse<PaginatedResponse<DisputeListItemResponse>>> getMyDisputes(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @ModelAttribute @ParameterObject DisputeListRequest filter) {
        return ResponseEntity.ok(new BaseResponse<>(true, "Lấy danh sách khiếu nại thành công",
                disputeService.getMyDisputes(requireUserId(principal), filter)));
    }

    @GetMapping("/me/summary")
    @Operation(summary = "Lấy thống kê hồ sơ khiếu nại của tôi", description = "Tính trên toàn bộ hồ sơ "
            + "của người dùng xác định từ JWT, độc lập với trang và bộ lọc của API danh sách. "
            + "averageResolutionHours chỉ tính hồ sơ đã giải quyết có resolvedAt không trước createdAt "
            + "và không ở tương lai; null nếu chưa có mẫu hợp lệ. restorationRate là approved / (approved + rejected) × 100, "
            + "null nếu chưa có hồ sơ đã giải quyết. Các thời điểm dùng giờ Việt Nam.")
    public ResponseEntity<BaseResponse<DisputeSummaryResponse>> getMySummary(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(new BaseResponse<>(true, "Lấy thống kê khiếu nại thành công",
                disputeService.getMySummary(requireUserId(principal))));
    }

    private Long requireUserId(UserPrincipal principal) {
        if (principal == null || principal.getId() == null) {
            throw new UnauthorizedException("Vui lòng đăng nhập để xem hồ sơ khiếu nại");
        }
        return principal.getId();
    }
}
