package com.be.scamshield.controller;

import com.be.scamshield.dto.BaseResponse;
import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.request.BlacklistResourceFilterRequest;
import com.be.scamshield.dto.request.WhitelistResourceFilterRequest;
import com.be.scamshield.dto.response.BlacklistResourceResponse;
import com.be.scamshield.dto.response.WhitelistResourceResponse;
import com.be.scamshield.service.IResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/resources")
@SecurityRequirements
@Tag(name = "Resources", description = "Public blacklist and verified whitelist resources")
public class ResourceController {
    private final IResourceService resourceService;

    @GetMapping("/blacklist")
    @Operation(summary = "Lấy blacklist được phân trang",
            description = "Trả về các chỉ báo lừa đảo đã được xác nhận và đang có hiệu lực để hiển thị trên giao diện danh sách đen, " +
                    "bao gồm tiêu đề, huy hiệu, mô tả, số lượng báo cáo và thời gian cập nhật.")
    public ResponseEntity<PaginatedResponse<BlacklistResourceResponse>> getBlackListResource(
            @Valid @ModelAttribute @ParameterObject BlacklistResourceFilterRequest filter) {
        return ResponseEntity.ok(resourceService.getBlackListResources(filter));
    }

    @GetMapping("/whitelist")
    @Operation(summary = "Lấy danh sách trắng được phân trang",
            description = "Trả về các tổ chức và tài nguyên chính thức đã xác minh. Hỗ trợ tìm kiếm theo tên, số điện thoại, tên miền và SMS Brandname; sắp xếp theo ngày xác minh hoặc tên.")
    public ResponseEntity<BaseResponse<PaginatedResponse<WhitelistResourceResponse>>> getWhiteListResource(
            @Valid @ModelAttribute @ParameterObject WhitelistResourceFilterRequest filter) {
        return ResponseEntity.ok(new BaseResponse<>(true, "Lấy danh sách trắng thành công",
                resourceService.getWhiteListResources(filter)));
    }
}
