package com.be.scamshield.dto.response;

import com.be.scamshield.constant.EducationContentType;
import com.be.scamshield.entity.content.EducationStructuredContent;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

public record EducationContentResponse(Long id, String title, String slug, EducationContentType contentType,
                                       String summary, EducationStructuredContent structuredContent,
                                       Category category, String tag, String badgeLabel,
                                       @Schema(description = "URL ảnh để hiển thị/tải; null khi chưa có file") String imageUrl,
                                       @Schema(description = "URL PDF; null khi chưa có file") String pdfUrl,
                                       String formatLabel, Integer imageWidth, Integer imageHeight,
                                       Integer displayOrder, LocalDateTime publishedAt, LocalDateTime updatedAt) {
    public record Category(String code, String name) {}
}
