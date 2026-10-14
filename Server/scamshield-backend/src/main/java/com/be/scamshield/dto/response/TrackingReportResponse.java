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
@Schema(description = "Thông tin dòng báo cáo hiển thị trên bảng quản lý tiến trình phê duyệt")
public class TrackingReportResponse {

    @Schema(description = "Mã báo cáo hiển thị", example = "#RPT-8492")
    private String id;

    @Schema(description = "ID gốc trong cơ sở dữ liệu", example = "8492")
    private Long rawId;

    @Schema(description = "Mã băm rút gọn đối soát", example = "e9b4...2a1f")
    private String hashId;

    @Schema(description = "Loại mục tiêu nghi vấn (PHONE, BANK, WEBSITE, TELEGRAM, APK)", example = "PHONE")
    private String targetType;

    @Schema(description = "Giá trị mục tiêu nghi vấn", example = "089.842.xxxx")
    private String targetValue;

    @Schema(description = "Thông tin chi tiết phụ của mục tiêu", example = "Đầu số MobiFone phát tán")
    private String targetSub;

    @Schema(description = "Tên danh mục thủ đoạn lừa đảo", example = "Mạo danh cán bộ thuế/A05")
    private String category;

    @Schema(description = "ID danh mục", example = "1")
    private Long categoryId;

    @Schema(description = "Thời gian gửi định dạng chuẩn", example = "14:22, 28/10/2024")
    private String submittedDate;

    @Schema(description = "Thời gian xử lý SLA đối soát", example = "Xong trong 14 phút")
    private String slaTime;

    @Schema(description = "Trạng thái SLA (completed, processing, merged)", example = "completed")
    private String slaStatus;

    @Schema(description = "Nhãn tóm tắt bằng chứng đính kèm", example = "3 ảnh • OCR Pass")
    private String evidenceBadge;

    @Schema(description = "Tổng số tệp bằng chứng", example = "3")
    private Integer evidenceCount;

    @Schema(description = "Trạng thái báo cáo (APPROVED_BLACKLIST, PENDING, MERGED_DUPLICATE, REJECTED)", example = "APPROVED_BLACKLIST")
    private String status;
}
