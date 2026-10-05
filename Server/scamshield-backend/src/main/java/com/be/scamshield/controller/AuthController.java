package com.be.scamshield.controller;

import com.be.scamshield.dto.*;
import com.be.scamshield.security.UserPrincipal;
import com.be.scamshield.service.IAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & Authorization API", description = "Endpoints for Login, Token Refresh, Change Password, Logout, and User Profile")
public class AuthController {

    private final IAuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticates user using Username or Phone Number and password. Returns JWT access token and refresh token.")
    public ResponseEntity<BaseResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(new BaseResponse<>(true, "Login successful", response));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access token", description = "Exchanges a valid refresh token for a new JWT access token.")
    public ResponseEntity<BaseResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(new BaseResponse<>(true, "Token refreshed successfully", response));
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
    @Operation(summary = "Logout user", description = "Revokes refresh token and clears user session.")
    public ResponseEntity<BaseResponse<String>> logout(@RequestBody(required = false) RefreshTokenRequest request,
                                                       @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String refreshToken = request != null ? request.getRefreshToken() : null;
        String username = userPrincipal != null ? userPrincipal.getUsername() : null;

        authService.logout(refreshToken, username);
        return ResponseEntity.ok(new BaseResponse<>(true, "Logged out successfully"));
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get current authenticated user profile", description = "Retrieves user details for the currently logged-in user.")
    public ResponseEntity<BaseResponse<UserDto>> getCurrentUserProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDto userProfile = authService.getCurrentUserProfile(userPrincipal.getUsername());
        return ResponseEntity.ok(new BaseResponse<>(true, "User profile retrieved successfully", userProfile));
    }
}
