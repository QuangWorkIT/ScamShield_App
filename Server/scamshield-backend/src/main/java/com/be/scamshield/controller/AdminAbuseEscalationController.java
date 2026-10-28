package com.be.scamshield.controller;

import com.be.scamshield.dto.BaseResponse;
import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.admin.AdminAbuseEscalationFilterRequest;
import com.be.scamshield.dto.admin.AdminAbuseEscalationResponse;
import com.be.scamshield.service.IAdminAbuseEscalationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/abuse-escalations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRATOR')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin Abuse Escalations", description = "Hàng đợi hồ sơ lạm dụng tài khoản dành cho quản trị viên")
public class AdminAbuseEscalationController {

    private final IAdminAbuseEscalationService adminAbuseEscalationService;

    @GetMapping
    @Operation(summary = "Lấy hàng đợi hồ sơ lạm dụng tài khoản",
            description = "Mặc định lấy PENDING. Hỗ trợ lọc PENDING, OPEN, DISMISSED hoặc ALL; tìm kiếm tài khoản/mã hồ sơ; "
                    + "phân trang từ 0, tối đa 100 hồ sơ/trang. Mặc định createdAt DESC, id DESC. "
                    + "Có thể dùng sort=priority,desc (HIGH trước) hoặc priority,asc (LOW trước), dựa trên severity. "
                    + "Không lấy hồ sơ RESOLVED cũ và cờ không gắn với tài khoản.")
    public ResponseEntity<BaseResponse<PaginatedResponse<AdminAbuseEscalationResponse>>> getEscalations(
            @Valid @ModelAttribute @ParameterObject AdminAbuseEscalationFilterRequest filter) {
        PaginatedResponse<AdminAbuseEscalationResponse> result = adminAbuseEscalationService.getEscalations(filter);
        return ResponseEntity.ok(new BaseResponse<>(true, "Lấy hàng đợi hồ sơ lạm dụng thành công", result));
    }
}
