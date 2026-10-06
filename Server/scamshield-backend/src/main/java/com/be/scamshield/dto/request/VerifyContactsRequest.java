package com.be.scamshield.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.ToString;

@Data
public class VerifyContactsRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Size(max = 254, message = "Email tối đa 254 ký tự")
    @JsonAlias("corporateEmail")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(max = 30, message = "Số điện thoại tối đa 30 ký tự")
    @JsonAlias("contactPhone")
    private String phoneNumber;

    @NotBlank(message = "Mã OTP email không được để trống")
    @Pattern(regexp = "[0-9]{6}", message = "Mã OTP email phải gồm 6 chữ số")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ToString.Exclude
    private String emailOtp;

    @NotBlank(message = "Mã OTP SMS không được để trống")
    @Pattern(regexp = "[0-9]{6}", message = "Mã OTP SMS phải gồm 6 chữ số")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ToString.Exclude
    private String phoneOtp;
}
