package com.be.scamshield.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.ToString;

import java.util.List;

@Data
@Schema(description = "Thông tin hồ sơ doanh nghiệp; gửi dưới dạng JSON trong multipart part request")
public class RegisterPartnerRequest {
    @NotBlank(message = "Tên doanh nghiệp không được để trống")
    @Size(max = 255, message = "Tên doanh nghiệp tối đa 255 ký tự")
    private String legalName;

    @NotBlank(message = "Mã số thuế / mã số doanh nghiệp không được để trống")
    @Pattern(regexp = "^[0-9]{10}(-?[0-9]{3})?$", message = "Mã số thuế gồm 10 hoặc 13 chữ số, có thể có dấu gạch nối trước 3 số cuối")
    private String taxCode;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Size(max = 254, message = "Email tối đa 254 ký tự")
    @Schema(description = "Email tạo tài khoản; chấp nhận email cá nhân hoặc doanh nghiệp", example = "partner@gmail.com")
    private String corporateEmail;

    @NotBlank(message = "Cần xác thực điện thoại trước khi đăng ký")
    @Pattern(regexp = "[A-Za-z0-9_-]{43}", message = "Mã xác nhận điện thoại không hợp lệ")
    @Schema(description = "Token từ /api/auth/verify-contacts sau khi xác thực OTP điện thoại; hạn dùng được trả trong expiresAt", accessMode = Schema.AccessMode.WRITE_ONLY)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ToString.Exclude
    private String verificationToken;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 72, message = "Mật khẩu phải từ 6 đến 72 ký tự")
    @Schema(description = "Mật khẩu tài khoản, từ 6 ký tự và tối đa 72 byte UTF-8", accessMode = Schema.AccessMode.WRITE_ONLY)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ToString.Exclude
    private String password;

    @NotBlank(message = "Họ tên và chức vụ người đại diện không được để trống")
    @Size(max = 255, message = "Thông tin người đại diện tối đa 255 ký tự")
    private String representativeNameAndTitle;

    @NotBlank(message = "Số điện thoại liên hệ không được để trống")
    @Size(max = 30, message = "Số điện thoại liên hệ tối đa 30 ký tự")
    @Pattern(regexp = "^[\\s().-]*(?:0|\\+[\\s().-]*8[\\s().-]*4)[\\s().-]*[35789](?:[\\s().-]*[0-9]){8}[\\s().-]*$",
            message = "Số điện thoại liên hệ phải là số di động Việt Nam hợp lệ, ví dụ 0912345678 hoặc +84912345678")
    private String contactPhone;

    @NotEmpty(message = "Cần ít nhất một tên miền chính thống")
    @Size(max = 50, message = "Tối đa 50 tên miền")
    private List<@NotBlank(message = "Tên miền không được để trống") @Size(max = 253, message = "Tên miền tối đa 253 ký tự") String> officialDomains;

    @NotEmpty(message = "Cần ít nhất một hotline chính thống")
    @Size(max = 50, message = "Tối đa 50 hotline")
    private List<@NotBlank(message = "Hotline không được để trống") @Size(max = 30, message = "Hotline tối đa 30 ký tự") String> officialHotlines;

    @NotEmpty(message = "Cần ít nhất một SMS Brandname")
    @Size(max = 50, message = "Tối đa 50 SMS Brandname")
    private List<@NotBlank(message = "SMS Brandname không được để trống") @Size(max = 100, message = "SMS Brandname tối đa 100 ký tự") String> smsBrandNames;

    @NotNull(message = "Cần xác định người đăng ký có phải đại diện pháp luật không")
    @Schema(description = "Nếu false, phải gửi authorizationFiles")
    private Boolean legalRepresentative;

    @AssertTrue(message = "Bạn phải cam kết thông tin chính xác và thuộc quyền sở hữu hợp pháp")
    private boolean agreeTerms;
}
