package com.be.scamshield.dto.response;

import com.be.scamshield.constant.DisputeIndicatorType;
import com.be.scamshield.constant.DisputeLegalRelationship;
import com.be.scamshield.constant.DisputeStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Nội dung bản nháp hoặc hồ sơ vừa gửi; các thời điểm là giờ Việt Nam (Asia/Ho_Chi_Minh)")
public record DisputeFormResponse(
        Long id,
        @Schema(description = "Mã hồ sơ tạo từ ID", example = "DSP-3091")
        String disputeCode,
        DisputeStatus status,
        DisputeIndicatorType indicatorType,
        @Schema(description = "Giá trị người dùng nhập khi còn DRAFT; giá trị chuẩn hóa sau khi gửi")
        String indicatorValue,
        DisputeLegalRelationship legalRelationship,
        String reason,
        @Schema(description = "Thời điểm đồng ý cam kết khi gửi; null với bản nháp")
        LocalDateTime declarationAcceptedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<DisputeListItemResponse.Attachment> attachments
) {
}
