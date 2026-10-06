package com.be.scamshield.controller;

import com.be.scamshield.dto.*;
import com.be.scamshield.dto.request.RegisterGoogleRequest;
import com.be.scamshield.dto.request.RegisterPersonalRequest;
import com.be.scamshield.exception.UnauthorizedException;
import com.be.scamshield.security.UserPrincipal;
import com.be.scamshield.service.IAuthService;
import com.be.scamshield.service.IOtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping({"/api/v1/auth", "/api/auth"})
@RequiredArgsConstructor
@Tag(name = "Authentication & Authorization API", description = "Endpoints for Login, Register, OTP, Token Refresh, Change Password, Logout, and User Profile")
public class AuthController {

    private final IAuthService authService;
    private final IOtpService otpService;

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticates user using Username, Email or Phone Number and password. Returns JWT access token in body and sets refresh token in HttpOnly cookie.")
    public ResponseEntity<BaseResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request, response);
        return ResponseEntity.ok(new BaseResponse<>(true, "Login successful", authResponse));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access token", description = "Exchanges a valid refresh token from HttpOnly cookie for a new JWT access token.")
    public ResponseEntity<BaseResponse<AuthResponse>> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletRequest request,
            HttpServletResponse response) {
        if (refreshToken == null || refreshToken.isBlank()) {
            refreshToken = extractCookie(request, "refreshToken");
        }
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedException("Refresh token cookie is missing");
        }
        AuthResponse authResponse = authService.refreshToken(refreshToken, response);
        return ResponseEntity.ok(new BaseResponse<>(true, "Token refreshed successfully", authResponse));
    }

    @PostMapping("/change-password")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Change user password", description = "Updates the authenticated user's password after validating their current password.")
    public ResponseEntity<BaseResponse<String>> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                                               @AuthenticationPrincipal UserPrincipal userPrincipal) {
        authService.changePassword(userPrincipal.getUsername(), request);
        return ResponseEntity.ok(new BaseResponse<>(true, "Password changed successfully"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Revokes refresh token cookie and clears user session.")
    public ResponseEntity<BaseResponse<String>> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletRequest request,
            HttpServletResponse response,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (refreshToken == null || refreshToken.isBlank()) {
            refreshToken = extractCookie(request, "refreshToken");
        }
        String username = userPrincipal != null ? userPrincipal.getUsername() : null;

        authService.logout(refreshToken, username, response);
        return ResponseEntity.ok(new BaseResponse<>(true, "Logged out successfully"));
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get current authenticated user profile", description = "Retrieves user details for the currently logged-in user.")
    public ResponseEntity<BaseResponse<UserDto>> getCurrentUserProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDto userProfile = authService.getCurrentUserProfile(userPrincipal.getUsername());
        return ResponseEntity.ok(new BaseResponse<>(true, "User profile retrieved successfully", userProfile));
    }

    @PostMapping("/send-email-otp")
    @Operation(summary = "Gửi OTP qua Email")
    public ResponseEntity<BaseResponse<Void>> sendEmailOtp(@RequestParam String email) {
        try {
            otpService.sendEmailOtp(email);
            return ResponseEntity.ok(new BaseResponse<>(true, "OTP đã được gửi đến email", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new BaseResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/send-phone-otp")
    @Operation(summary = "Gửi OTP qua Số điện thoại")
    public ResponseEntity<BaseResponse<Void>> sendPhoneOtp(@RequestParam String phoneNumber) {
        try {
            otpService.sendPhoneOtp(phoneNumber);
            return ResponseEntity.ok(new BaseResponse<>(true, "OTP đã được gửi đến số điện thoại", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new BaseResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/register/personal")
    @Operation(summary = "Đăng ký tài khoản cá nhân")
    public ResponseEntity<BaseResponse<Void>> registerPersonal(@Valid @RequestBody RegisterPersonalRequest request) {
        try {
            authService.registerPersonal(request);
            return ResponseEntity.ok(new BaseResponse<>(true, "Registration successful", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new BaseResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/register/google")
    @Operation(summary = "Đăng ký bằng tài khoản Google")
    public ResponseEntity<BaseResponse<Void>> registerGoogle(@Valid @RequestBody RegisterGoogleRequest request) {
        try {
            authService.registerGoogle(request);
            return ResponseEntity.ok(new BaseResponse<>(true, "Google registration successful", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new BaseResponse<>(false, e.getMessage(), null));
        }
    }

    private String extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
