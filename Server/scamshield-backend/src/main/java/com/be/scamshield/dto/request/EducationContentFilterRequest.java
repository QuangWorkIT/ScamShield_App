package com.be.scamshield.dto.request;

import com.be.scamshield.constant.EducationContentType;
import com.be.scamshield.constant.EducationSort;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class EducationContentFilterRequest extends EducationHubFilterRequest {
    @Schema(description = "SCENARIO hoặc POCKET_CARD; bỏ trống để lấy cả hai")
    private EducationContentType contentType;

    @Size(max = 100, message = "Từ khóa không được vượt quá 100 ký tự")
    @Schema(description = "Tìm trong tiêu đề và mô tả ngắn; không phân biệt chữ hoa/thường")
    private String keyword;

    @Min(value = 0, message = "Trang phải từ 0 trở lên")
    @Max(value = 100000, message = "Trang không được vượt quá 100000")
    @Schema(defaultValue = "0", description = "Số trang, bắt đầu từ 0")
    private int page = 0;

    @Min(value = 1, message = "Kích thước trang phải từ 1 đến 50")
    @Max(value = 50, message = "Kích thước trang phải từ 1 đến 50")
    @Schema(defaultValue = "12")
    private int size = 12;

    @Schema(description = "Mặc định POCKET_CARD theo DISPLAY_ORDER; nội dung khác theo LATEST. Có thứ tự phụ ổn định theo ID.")
    private EducationSort sort;
}
