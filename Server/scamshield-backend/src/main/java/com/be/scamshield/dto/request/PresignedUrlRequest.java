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
public class PresignedUrlRequest {

    @NotBlank(message = "Tên tệp không được để trống")
    private String fileName;

    @NotBlank(message = "Loại MIME/content-type của tệp không được để trống (ví dụ: image/png, image/jpeg)")
    private String contentType;
}
