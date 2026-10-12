package com.be.scamshield.controller;

import com.be.scamshield.dto.BaseResponse;
import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.request.EducationContentFilterRequest;
import com.be.scamshield.dto.request.EducationHubFilterRequest;
import com.be.scamshield.dto.response.EducationContentResponse;
import com.be.scamshield.dto.response.EducationFiltersResponse;
import com.be.scamshield.dto.response.EducationHubResponse;
import com.be.scamshield.service.IEducationHubService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/education-hub")
@RequiredArgsConstructor
@Validated
@SecurityRequirements
@Tag(name = "EducationHub", description = "Ca giải phẫu thủ đoạn và thẻ giáo dục công khai; chỉ nội dung đã xuất bản")
public class EducationHubController {
    private final IEducationHubService educationHubService;

    @GetMapping
    @Operation(summary = "Lấy trang Education Hub", description = "Trả bộ lọc, tối đa 4 ca mới nhất và 3 thẻ gia đình theo displayOrder. "
            + "categoryCode lọc ca giải phẫu; thẻ gia đình vẫn hiển thị chung. Chỉ PUBLISHED có publishedAt không nằm trong tương lai, "
            + "danh mục còn hoạt động hoặc không gắn danh mục. Giờ Việt Nam.")
    public ResponseEntity<BaseResponse<EducationHubResponse>> getHub(@Valid @ModelAttribute @ParameterObject EducationHubFilterRequest filter) {
        return ResponseEntity.ok(new BaseResponse<>(true, "Lấy Education Hub thành công", educationHubService.getHub(filter)));
    }

    @GetMapping("/contents")
    @Operation(summary = "Lấy danh sách nội dung Education Hub", description = "Lọc SCENARIO/POCKET_CARD, categoryCode và keyword; "
            + "phân trang từ 0, tối đa 50 mục/trang. Không trả bài ARTICLE, bản nháp hoặc nội dung lưu trữ. "
            + "Ảnh/PDF trả URL khi có file; null khi chưa có. Nội dung minh họa và lời khuyên nằm trong structuredContent.")
    public ResponseEntity<BaseResponse<PaginatedResponse<EducationContentResponse>>> getContents(
            @Valid @ModelAttribute @ParameterObject EducationContentFilterRequest filter) {
        return ResponseEntity.ok(new BaseResponse<>(true, "Lấy danh sách Education Hub thành công", educationHubService.getContents(filter)));
    }

    @GetMapping("/contents/{slug}")
    @Operation(summary = "Lấy chi tiết ca giải phẫu hoặc thẻ giáo dục theo slug", description = "Áp dụng cùng điều kiện công khai như danh sách. "
            + "Không có hoặc chưa xuất bản trả 404. Trả slug để FE xây dựng link chia sẻ.")
    public ResponseEntity<BaseResponse<EducationContentResponse>> getContent(
            @PathVariable @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug chỉ gồm chữ thường, số và dấu gạch ngang") String slug) {
        return ResponseEntity.ok(new BaseResponse<>(true, "Lấy chi tiết Education Hub thành công", educationHubService.getContent(slug)));
    }

    @GetMapping("/filters")
    @Operation(summary = "Lấy bộ lọc Education Hub", description = "Hai loại nội dung và danh mục đang hoạt động trong database để tạo tab hoặc dropdown. "
            + "Chọn Tất cả bằng cách bỏ categoryCode.")
    public ResponseEntity<BaseResponse<EducationFiltersResponse>> getFilters() {
        return ResponseEntity.ok(new BaseResponse<>(true, "Lấy bộ lọc Education Hub thành công", educationHubService.getFilters()));
    }
}
