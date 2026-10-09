package com.be.scamshield.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReportRequest {

    @NotBlank(message = "Loại đe dọa không được để trống (PHONE, WEBSITE, BANK_ACCOUNT)")
    private String threatType;

    @NotBlank(message = "Chỉ số mục tiêu (Số điện thoại, URL hoặc STK) không được để trống")
    private String targetIdentifier;

    @NotBlank(message = "Danh mục thủ đoạn không được để trống")
    private String category;

    @NotBlank(message = "Mô tả ngắn gọn hành vi không được để trống")
    private String description;

    @NotNull(message = "Bạn cần xác nhận thông tin cung cấp là trung thực")
    @AssertTrue(message = "Bạn cần xác nhận thông tin cung cấp là trung thực")
    private Boolean isConfirmed;

    // Optional list of pre-uploaded S3 evidence URLs/items
    private List<EvidenceItemDto> evidences;

    private List<String> attachmentUrls;
}
