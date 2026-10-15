package com.be.scamshield.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Yêu cầu khởi tạo hoặc khôi phục phiên khách vãng lai")
public class CreateGuestSessionRequest {

    @Schema(description = "Token phiên hiện tại trên client (nếu có, để kiểm tra và khôi phục phiên)", example = "gs_9b3f021ad45e481aa661299ef87b001a")
    private String sessionToken;

    @Schema(description = "Fingerprint thiết bị từ client (Canvas/WebGL/Audio hash)", example = "fp_a1b2c3d4e5f6")
    private String deviceFingerprint;
}
