package com.be.scamshield.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class WhitelistResourceFilterRequest {
    @Min(value = 0, message = "Trang phải lớn hơn hoặc bằng 0")
    private int page = 0;

    @Min(value = 1, message = "Kích thước trang phải ít nhất là 1")
    @Max(value = 50, message = "Kích thước trang không được vượt quá 50")
    private int size = 10;

    private String keyword;

    @Pattern(regexp = "newest|name", message = "Sắp xếp phải là newest hoặc name")
    private String sortBy = "newest";
}
