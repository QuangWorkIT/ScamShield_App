package com.be.scamshield.dto.request;

import com.be.scamshield.constant.DisputeStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "Bộ lọc hồ sơ khiếu nại của người dùng đang đăng nhập")
public class DisputeListRequest {

    @Size(max = 5, message = "Chỉ được chọn tối đa 5 trạng thái khiếu nại")
    @Schema(description = "Bỏ trống để lấy mọi trạng thái. Chọn nhiều trạng thái bằng dấu phẩy "
            + "hoặc lặp lại tham số status", example = "IN_REVIEW,NEEDS_MORE_INFO")
    private List<@NotNull(message = "Trạng thái khiếu nại không được để trống") DisputeStatus> status;

    @Min(value = 0, message = "Trang không được nhỏ hơn 0")
    @Max(value = 100000, message = "Trang không được lớn hơn 100000")
    @Schema(description = "Chỉ số trang, bắt đầu từ 0", defaultValue = "0", example = "0")
    private int page = 0;

    @Min(value = 1, message = "Số hồ sơ mỗi trang phải từ 1 trở lên")
    @Max(value = 50, message = "Mỗi trang tối đa 50 hồ sơ")
    @Schema(description = "Số hồ sơ mỗi trang", defaultValue = "10", example = "10")
    private int size = 10;
}
