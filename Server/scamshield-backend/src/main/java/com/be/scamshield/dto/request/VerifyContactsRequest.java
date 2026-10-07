package com.be.scamshield.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.ToString;

@Data
public class VerifyContactsRequest {
    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(max = 30, message = "Số điện thoại tối đa 30 ký tự")
    @Pattern(regexp = "^[\\s().-]*(?:0|\\+[\\s().-]*8[\\s().-]*4)[\\s().-]*[35789](?:[\\s().-]*[0-9]){8}[\\s().-]*$",
            message = "Số điện thoại phải là số di động Việt Nam hợp lệ, ví dụ 0912345678 hoặc +84912345678")
    @JsonAlias("contactPhone")
    private String phoneNumber;

    @NotBlank(message = "Mã OTP SMS không được để trống")
    @Pattern(regexp = "[0-9]{6}", message = "Mã OTP SMS phải gồm 6 chữ số")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ToString.Exclude
    private String phoneOtp;
}
