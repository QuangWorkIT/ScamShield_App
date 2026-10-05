package com.be.scamshield.controller;

import com.be.scamshield.dto.request.RegisterPersonalRequest;
import com.be.scamshield.dto.request.RegisterGoogleRequest;
import com.be.scamshield.service.IAuthService;
import com.be.scamshield.service.IOtpService;
import com.be.scamshield.dto.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
@Tag(name = "Auth", description = "Các API liên quan đến xác thực, đăng ký")
public class AuthController {

    private final IAuthService authService;
    private final IOtpService otpService;

    @PostMapping("/send-email-otp")
    @Operation(summary = "Gửi OTP qua Email")
    public ResponseEntity<BaseResponse<Void>> sendEmailOtp(
            @RequestParam @NotBlank(message = "Email không được để trống") @Email(message = "Email không đúng định dạng") String email) {
        otpService.sendEmailOtp(email);
        return ResponseEntity.ok(new BaseResponse<>(true, "OTP đã được gửi đến email", null));
    }

    @PostMapping("/send-phone-otp")
    @Operation(summary = "Gửi OTP qua Số điện thoại")
    public ResponseEntity<BaseResponse<Void>> sendPhoneOtp(
            @RequestParam @NotBlank(message = "Số điện thoại không được để trống") @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải bắt đầu bằng số 0 và gồm đúng 10 chữ số") String phoneNumber) {
        otpService.sendPhoneOtp(phoneNumber);
        return ResponseEntity.ok(new BaseResponse<>(true, "OTP đã được gửi đến số điện thoại", null));
    }

    @PostMapping("/register/personal")
    @Operation(summary = "Đăng ký tài khoản cá nhân")
    public ResponseEntity<BaseResponse<Void>> registerPersonal(@Valid @RequestBody RegisterPersonalRequest request) {
        authService.registerPersonal(request);
        return ResponseEntity.ok(new BaseResponse<>(true, "Registration successful", null));
    }

    @PostMapping("/register/google")
    @Operation(summary = "Đăng ký cá nhân qua Google")
    public ResponseEntity<BaseResponse<Void>> registerGoogle(@Valid @RequestBody RegisterGoogleRequest request) {
        authService.registerGoogle(request);
        return ResponseEntity.ok(new BaseResponse<>(true, "Google Registration successful", null));
    }
}
