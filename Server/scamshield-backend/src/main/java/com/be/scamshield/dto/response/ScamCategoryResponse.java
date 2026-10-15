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
@Schema(description = "Danh mục thủ đoạn lừa đảo phục vụ bộ lọc tìm kiếm")
public class ScamCategoryResponse {

    @Schema(description = "ID danh mục", example = "1")
    private Long id;

    @Schema(description = "Mã danh mục", example = "IMPERSONATION_OFFICER")
    private String code;

    @Schema(description = "Tên hiển thị", example = "Mạo danh cán bộ thuế/A05")
    private String name;

    @Schema(description = "Mô tả thủ đoạn", example = "Giả danh cơ quan công an, thuế yêu cầu chuyển tiền")
    private String description;
}
