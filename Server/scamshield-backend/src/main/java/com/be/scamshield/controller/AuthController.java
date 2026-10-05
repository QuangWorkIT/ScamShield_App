package com.be.scamshield.controller;

import com.be.scamshield.dto.request.RegisterPersonalRequest;
import com.be.scamshield.service.IAuthService;
import lombok.RequiredArgsConstructor;
import com.be.scamshield.dto.BaseResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Các API liên quan đến xác thực, đăng ký")
public class AuthController {

    private final IAuthService authService;
    private final com.be.scamshield.service.IOtpService otpService;

    @PostMapping("/send-email-otp")
    @io.swagger.v3.oas.annotations.Operation(summary = "Gửi OTP qua Email")
    public ResponseEntity<BaseResponse<Void>> sendEmailOtp(@RequestParam String email) {
        try {
            otpService.sendEmailOtp(email);
            return ResponseEntity.ok(new BaseResponse<>(true, "OTP đã được gửi đến email", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new BaseResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/send-phone-otp")
    @io.swagger.v3.oas.annotations.Operation(summary = "Gửi OTP qua Số điện thoại")
    public ResponseEntity<BaseResponse<Void>> sendPhoneOtp(@RequestParam String phoneNumber) {
        try {
            otpService.sendPhoneOtp(phoneNumber);
            return ResponseEntity.ok(new BaseResponse<>(true, "OTP đã được gửi đến số điện thoại", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new BaseResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/register/personal")
    public ResponseEntity<BaseResponse<Void>> registerPersonal(@Valid @RequestBody RegisterPersonalRequest request) {
        try {
            authService.registerPersonal(request);
            return ResponseEntity.ok(new BaseResponse<>(true, "Registration successful", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new BaseResponse<>(false, e.getMessage(), null));
        }
    }
}
