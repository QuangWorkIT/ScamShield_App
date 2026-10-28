package com.be.scamshield.controller;

import com.be.scamshield.dto.BaseResponse;
import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.request.ModeratorAbuseEscalationFilterRequest;
import com.be.scamshield.dto.response.ModeratorAbuseEscalationResponse;
import com.be.scamshield.service.IModeratorAbuseEscalationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/moderator/users/{userId}/abuse-escalations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MODERATOR')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Moderator Abuse Escalations", description = "Lịch sử hồ sơ lạm dụng tài khoản dành cho kiểm duyệt viên")
public class ModeratorAbuseEscalationController {

    private final IModeratorAbuseEscalationService moderatorAbuseEscalationService;

    @GetMapping
    @Operation(summary = "Lấy lịch sử hồ sơ lạm dụng của một tài khoản",
            description = "Lấy các hồ sơ PENDING, DISMISSED, OPEN, mới nhất trước (createdAt DESC, id DESC). "
                    + "Dữ liệu RESOLVED cũ không thuộc danh sách này và không bị thay đổi. "
                    + "Tài khoản tồn tại nhưng chưa có hồ sơ trả danh sách rỗng; tài khoản không tồn tại trả 404.")
    public ResponseEntity<BaseResponse<PaginatedResponse<ModeratorAbuseEscalationResponse>>> getEscalations(
            @Parameter(description = "ID tài khoản bị xem xét", example = "842") @PathVariable Long userId,
            @Valid @ModelAttribute @ParameterObject ModeratorAbuseEscalationFilterRequest filter) {
        PaginatedResponse<ModeratorAbuseEscalationResponse> result =
                moderatorAbuseEscalationService.getEscalations(userId, filter);
        return ResponseEntity.ok(new BaseResponse<>(true, "Lấy lịch sử hồ sơ lạm dụng thành công", result));
    }
}
