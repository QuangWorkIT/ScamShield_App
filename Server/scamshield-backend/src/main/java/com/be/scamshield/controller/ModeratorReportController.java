package com.be.scamshield.controller;

import com.be.scamshield.constant.ReportPriority;
import com.be.scamshield.dto.BaseResponse;
import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.response.ModeratorQueueCountsResponse;
import com.be.scamshield.dto.response.ModeratorReportResponse;
import com.be.scamshield.service.IModeratorReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@RestController
@RequestMapping("/api/moderator/reports")
@RequiredArgsConstructor
@Tag(name = "Moderator Report Queue", description = "API quản lý hàng đợi xét duyệt báo cáo lừa đảo dành cho kiểm duyệt viên")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('MODERATOR', 'ADMINISTRATOR')")
public class ModeratorReportController {

    private static final Set<String> ALLOWED_SORT_PROPERTIES = Set.of(
            "id",
            "createdAt",
            "updatedAt",
            "priority",
            "priorityScore",
            "status",
            "reportCountSignal"
    );

    private final IModeratorReportService moderatorReportService;

    @GetMapping
    @Operation(summary = "Lấy danh sách hàng đợi xét duyệt báo cáo lừa đảo",
            description = "Hỗ trợ phân trang, tìm kiếm theo ID (CS-YYYY-XXXX), đối tượng, danh mục, người gửi; lọc theo tab (ALL, PENDING, IN_REVIEW, LOCKED) và độ ưu tiên")
    public ResponseEntity<BaseResponse<PaginatedResponse<ModeratorReportResponse>>> getReportQueue(
            @Parameter(description = "Tab trạng thái hàng đợi (ALL, PENDING, IN_REVIEW, LOCKED)")
            @RequestParam(required = false, defaultValue = "ALL") String tab,
            @Parameter(description = "Từ khóa tìm kiếm (Mã hồ sơ CS-..., SĐT, URL, STK, danh mục, người gửi)")
            @RequestParam(required = false) String search,
            @Parameter(description = "Lọc theo mức độ ưu tiên (URGENT, HIGH, NORMAL)")
            @RequestParam(required = false) ReportPriority priority,
            @Parameter(description = "Chỉ số trang (bắt đầu từ 0)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số lượng hồ sơ mỗi trang")
            @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Trường sắp xếp (ví dụ: createdAt,desc hoặc priority,desc)")
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        if (page < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page index must not be less than zero");
        }
        if (size < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page size must not be less than one");
        }
        int cappedSize = Math.min(size, 100);

        String[] sortParams = sort.split(",");
        Sort.Direction direction = (sortParams.length > 1 && "asc".equalsIgnoreCase(sortParams[1].trim()))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        String sortProperty = sortParams[0].trim();
        if (!ALLOWED_SORT_PROPERTIES.contains(sortProperty)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported sort field: " + sortProperty);
        }

        Pageable pageable = PageRequest.of(page, cappedSize, Sort.by(direction, sortProperty));
        PaginatedResponse<ModeratorReportResponse> reports = moderatorReportService.getReportQueue(tab, search, priority, pageable);

        return ResponseEntity.ok(new BaseResponse<>(true, "Lấy danh sách hàng đợi xét duyệt thành công", reports));
    }

    @GetMapping("/counts")
    @Operation(summary = "Lấy số lượng hồ sơ theo từng tab trong hàng đợi",
            description = "Trả về tổng số ca, số ca đang chờ duyệt (Pending), đang xem xét (In Review), và đã khóa (Locked)")
    public ResponseEntity<BaseResponse<ModeratorQueueCountsResponse>> getQueueCounts() {
        ModeratorQueueCountsResponse counts = moderatorReportService.getQueueCounts();
        return ResponseEntity.ok(new BaseResponse<>(true, "Lấy số lượng hàng đợi xét duyệt thành công", counts));
    }
}
