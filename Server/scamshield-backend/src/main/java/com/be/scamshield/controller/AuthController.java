package com.be.scamshield.controller;

import com.be.scamshield.dto.request.RegisterPersonalRequest;
import com.be.scamshield.dto.request.RegisterGoogleRequest;
import com.be.scamshield.dto.request.VerifyContactsRequest;
import com.be.scamshield.dto.response.ContactVerificationResponse;
import com.be.scamshield.serviceImpl.ContactVerificationService;
import com.be.scamshield.service.IAuthService;
import com.be.scamshield.service.IOtpService;
import com.be.scamshield.dto.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
    private final ContactVerificationService contactVerificationService;

    @PostMapping("/verify-contacts")
    @Operation(summary = "Xác thực OTP email và điện thoại trước khi đăng ký",
            description = "Dùng chung cho khách chưa đăng nhập, đăng ký cá nhân và Partner. Trả token dùng một lần, hạn 10 phút giờ Việt Nam (UTC+07:00); chưa tạo tài khoản.")
    public ResponseEntity<BaseResponse<ContactVerificationResponse>> verifyContacts(
            @Valid @RequestBody VerifyContactsRequest request) {
        return ResponseEntity.ok(new BaseResponse<>(true, "Email và điện thoại đã xác thực; có thể đăng ký",
                contactVerificationService.verifyContacts(request)));
    }

    @PostMapping("/send-email-otp")
    @Operation(summary = "Gửi OTP qua Email")
    public ResponseEntity<BaseResponse<Void>> sendEmailOtp(
            @RequestParam @NotBlank(message = "Email không được để trống") @Email(message = "Email không đúng định dạng") String email) {
        otpService.sendEmailOtp(email);
        return ResponseEntity.ok(new BaseResponse<>(true, "OTP đã được gửi đến email", null));
    }

    @PostMapping("/send-phone-otp")
    @Operation(summary = "Gửi OTP SMS qua Firebase", description = "Cần reCAPTCHA token lấy từ FE. Giới hạn nội bộ tối đa 10 lượt/24 giờ và 60 giây/số; mã được dùng khi đăng ký.")
    public ResponseEntity<BaseResponse<Void>> sendPhoneOtp(
            @RequestParam @NotBlank(message = "Số điện thoại không được để trống") @Size(max = 30, message = "Số điện thoại tối đa 30 ký tự") String phoneNumber,
            @RequestParam @NotBlank(message = "reCAPTCHA token không được để trống") @Size(max = 8192, message = "reCAPTCHA token quá dài") String recaptchaToken) {
        otpService.sendPhoneOtp(phoneNumber, recaptchaToken);
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
