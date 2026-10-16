package com.be.scamshield.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class BlacklistResourceFilterRequest {
    @Min(value = 0, message = "Page must be greater than or equal to 0")
    private int page = 0;

    @Min(value = 1, message = "Size must be at least 1")
    @Max(value = 50, message = "Size must be at most 50")
    private int size = 10;

    private String keyword;

    @Pattern(regexp = "^[A-Z_]+$", message = "Resource type must use uppercase letters and underscores")
    private String resourceType;
}
