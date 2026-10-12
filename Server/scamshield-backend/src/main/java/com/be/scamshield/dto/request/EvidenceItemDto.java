package com.be.scamshield.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceItemDto {

    @NotBlank(message = "URL hình ảnh/bằng chứng không được để trống")
    private String fileUrl;

    private String fileHash;

    private String evidenceType; // IMAGE, SCREENSHOT, PDF, DOCUMENT

    private String fileName;
}
