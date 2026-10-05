package com.be.scamshield.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
public class RegisterPersonalRequest {

    @Schema(description = "Họ và tên người dùng", example = "Nguyễn Văn A")
    @NotBlank(message = "Họ và tên không được để trống")
    @Size(min = 2, message = "Họ và tên phải có ít nhất 2 ký tự")
    @Pattern(regexp = "^\\p{Lu}\\p{Ll}*(\\s+\\p{Lu}\\p{Ll}*)*$", message = "Họ và tên phải viết hoa chữ cái đầu của mỗi từ")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải đúng định dạng và gồm 10 chữ số")
    private String phoneNumber;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    @NotBlank(message = "Mã OTP Email không được để trống")
    private String emailOtp;

    // Tạm thời bỏ qua yêu cầu bắt buộc nhập mã OTP Số điện thoại
    // @NotBlank(message = "Mã OTP Số điện thoại không được để trống")
    private String phoneOtp;

    @AssertTrue(message = "Bạn phải đồng ý với điều khoản sử dụng")
    private boolean agreeTerms;

    private boolean receiveAlerts;
}
