package com.be.scamshield.dto.request;

import com.be.scamshield.constant.ScamDashboardPeriod;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class ScamDashboardFilterRequest {
    @NotNull(message = "Khoảng thời gian không được để trống")
    @Schema(description = "Mặc định LAST_30_DAYS. QUARTER cần year và quarter; YEAR cần year; CUSTOM cần fromDate và toDate.",
            defaultValue = "LAST_30_DAYS")
    private ScamDashboardPeriod period = ScamDashboardPeriod.LAST_30_DAYS;

    @Min(value = 2000, message = "Năm phải từ 2000 trở lên")
    @Max(value = 9998, message = "Năm không được vượt quá 9998")
    @Schema(example = "2025")
    private Integer year;

    @Min(value = 1, message = "Quý phải từ 1 đến 4")
    @Max(value = 4, message = "Quý phải từ 1 đến 4")
    @Schema(example = "1")
    private Integer quarter;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    @Schema(description = "Ngày bắt đầu (yyyy-MM-dd), chỉ dùng với CUSTOM", example = "2025-01-01")
    private LocalDate fromDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    @Schema(description = "Ngày kết thúc, tính cả ngày này; CUSTOM tối đa 366 ngày", example = "2025-01-31")
    private LocalDate toDate;

    @Pattern(regexp = "^[0-9]{2}$", message = "Mã tỉnh/thành phải gồm 2 chữ số")
    @Schema(description = "Mã tỉnh từ /api/dashboard/filters; bỏ trống để lấy toàn quốc", example = "01")
    private String regionCode;

    @Pattern(regexp = "^[A-Z0-9_]{1,64}$", message = "Mã danh mục chỉ gồm chữ hoa, số và dấu gạch dưới (tối đa 64 ký tự)")
    @Schema(description = "Bộ lọc mở rộng: mã danh mục từ /api/dashboard/filters", example = "VIEC_LAM")
    private String categoryCode;

    @Pattern(regexp = "^[A-Z][A-Z0-9_]{0,31}$", message = "Loại đối tượng phải là mã chữ hoa hợp lệ (tối đa 32 ký tự)")
    @Schema(description = "Bộ lọc mở rộng: loại đối tượng từ /api/dashboard/filters", example = "URL")
    private String indicatorType;
}
