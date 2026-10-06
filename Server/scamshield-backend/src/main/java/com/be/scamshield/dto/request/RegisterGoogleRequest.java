package com.be.scamshield.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterGoogleRequest {

    @Schema(description = "Token ID (JWT) nhận được từ Google Sign-In ở Frontend", example = "eyJhbGciOiJSUzI1NiIs...")
    @NotBlank(message = "Google ID Token không được để trống")
    private String idToken;

    @Schema(description = "Số điện thoại người dùng (bắt buộc vì DB yêu cầu)", example = "0912345678")
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải bắt đầu bằng số 0 và gồm đúng 10 chữ số")
    private String phoneNumber;

    @NotBlank(message = "Mã OTP SMS không được để trống")
    @Pattern(regexp = "^[0-9]{6}$", message = "Mã OTP SMS phải gồm 6 chữ số")
    private String phoneOtp;

    @AssertTrue(message = "Bạn phải đồng ý với điều khoản sử dụng")
    private boolean agreeTerms;

    private boolean receiveAlerts;
}
