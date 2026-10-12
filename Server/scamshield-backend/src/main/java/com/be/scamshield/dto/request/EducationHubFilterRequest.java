package com.be.scamshield.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class EducationHubFilterRequest {
    @Pattern(regexp = "^[A-Z0-9_]{1,64}$", message = "Mã danh mục chỉ gồm chữ hoa, số và dấu gạch dưới (tối đa 64 ký tự)")
    @Schema(description = "Mã danh mục từ API filters; bỏ trống để lấy tất cả", example = "VIEC_LAM")
    private String categoryCode;
}
