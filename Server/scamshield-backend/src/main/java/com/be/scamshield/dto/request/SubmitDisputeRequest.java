package com.be.scamshield.dto.request;

import com.be.scamshield.constant.DisputeIndicatorType;
import com.be.scamshield.constant.DisputeLegalRelationship;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "Thông tin đầy đủ để gửi khiếu nại; gửi JSON trong multipart part request")
public class SubmitDisputeRequest {

    @NotNull(message = "Vui lòng chọn loại chỉ số cần khiếu nại")
    @Schema(example = "PHONE")
    private DisputeIndicatorType indicatorType;

    @NotBlank(message = "Chỉ số cần khiếu nại không được để trống")
    @Size(max = 255, message = "Chỉ số cần khiếu nại tối đa 255 ký tự")
    @Schema(description = "Giá trị chỉ số; backend chuẩn hóa rồi tìm xác thực blacklist còn ACTIVE", example = "0912348899")
    private String indicatorValue;

    @NotNull(message = "Vui lòng chọn quan hệ pháp lý với chỉ số")
    @Schema(example = "LEGAL_REPRESENTATIVE")
    private DisputeLegalRelationship legalRelationship;

    @NotBlank(message = "Lý do khiếu nại và giải trình không được để trống")
    @Size(max = 10000, message = "Lý do khiếu nại và giải trình tối đa 10000 ký tự")
    @Schema(example = "Đây là hotline chính chủ của doanh nghiệp. Đề nghị xem xét nhãn blacklist.")
    private String reason;

    @AssertTrue(message = "Bạn phải cam kết thông tin và tài liệu chính xác, chịu trách nhiệm pháp lý")
    @Schema(description = "Phải true khi gửi hồ sơ; backend tự ghi thời điểm đồng ý cam kết", example = "true")
    private boolean agreeTerms;

    @Size(max = 10, message = "Mỗi lần chỉ được xóa tối đa 10 tệp bằng chứng")
    @Schema(description = "ID tệp cần xóa khỏi bản nháp khi gửi; không dùng khi tạo hồ sơ trực tiếp")
    private List<@NotNull(message = "ID bằng chứng không được để trống")
            @Positive(message = "ID bằng chứng phải lớn hơn 0") Long> removedEvidenceIds;
}
