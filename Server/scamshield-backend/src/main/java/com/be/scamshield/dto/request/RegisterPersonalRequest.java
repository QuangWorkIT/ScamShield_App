package com.be.scamshield.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    @Size(max = 254, message = "Email tối đa 254 ký tự")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 72, message = "Mật khẩu phải từ 6 đến 72 ký tự")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ToString.Exclude
    private String password;

    @NotBlank(message = "Cần xác thực email và điện thoại trước khi đăng ký")
    @Pattern(regexp = "[A-Za-z0-9_-]{43}", message = "Mã xác nhận liên hệ không hợp lệ")
    @Schema(description = "Token từ /api/auth/verify-contacts, hạn 10 phút", accessMode = Schema.AccessMode.WRITE_ONLY)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ToString.Exclude
    private String verificationToken;

    @AssertTrue(message = "Bạn phải đồng ý với điều khoản sử dụng")
    private boolean agreeTerms;

    private boolean receiveAlerts;
}
