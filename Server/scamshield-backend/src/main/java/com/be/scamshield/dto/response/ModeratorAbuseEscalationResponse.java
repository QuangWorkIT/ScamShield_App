package com.be.scamshield.dto.response;

import com.be.scamshield.constant.AbuseFlagStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Hồ sơ lạm dụng tài khoản dành cho kiểm duyệt viên")
public class ModeratorAbuseEscalationResponse {
    private Long id;

    @Schema(description = "Mã hiển thị được sinh từ ID hồ sơ", example = "ESC-0041")
    private String escalationCode;

    private Long userId;

    @Schema(description = "Báo cáo liên quan theo liên kết hiện có; null nếu hồ sơ chưa liên kết báo cáo")
    private Long reportId;

    private String flagType;
    private String severity;
    private String reason;
    private String evidence;
    private AbuseFlagStatus status;
    private LocalDateTime createdAt;
}
