package com.be.scamshield.dto.request;

import com.be.scamshield.constant.DisputeIndicatorType;
import com.be.scamshield.constant.DisputeLegalRelationship;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "Thông tin lưu nháp, các trường nội dung được phép bỏ trống. "
        + "Mỗi lần lưu thay thế toàn bộ trường nội dung; tệp mới được thêm vào các tệp đã lưu.")
public class SaveDisputeDraftRequest {

    @Schema(example = "PHONE")
    private DisputeIndicatorType indicatorType;

    @Size(max = 255, message = "Chỉ số cần khiếu nại tối đa 255 ký tự")
    @Schema(example = "0912348899")
    private String indicatorValue;

    @Schema(example = "LEGAL_REPRESENTATIVE")
    private DisputeLegalRelationship legalRelationship;

    @Size(max = 10000, message = "Lý do khiếu nại và giải trình tối đa 10000 ký tự")
    private String reason;

    @Size(max = 10, message = "Mỗi lần chỉ được xóa tối đa 10 tệp bằng chứng")
    @Schema(description = "ID tệp đã lưu cần xóa khỏi chính bản nháp này; không dùng khi tạo bản nháp mới")
    private List<@NotNull(message = "ID bằng chứng không được để trống")
            @Positive(message = "ID bằng chứng phải lớn hơn 0") Long> removedEvidenceIds;
}
