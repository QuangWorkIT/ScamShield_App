package com.be.scamshield.service;

import com.be.scamshield.dto.*;
import com.be.scamshield.dto.request.RegisterPersonalRequest;

public interface IAuthService {

    /**
     * Registers a new personal user account.
     */
    void registerPersonal(RegisterPersonalRequest request);

    /**
     * Authenticates user with username or phone number (or email) and password.
     */
    AuthResponse login(LoginRequest request);

    /**
     * Exchanges a valid refresh token for a new access token.
     */
    AuthResponse refreshToken(RefreshTokenRequest request);

    /**
     * Changes the authenticated user's password.
     */
    void changePassword(String currentUsername, ChangePasswordRequest request);

    /**
     * Logs out the user by invalidating refresh tokens.
     */
    void logout(String refreshToken, String currentUsername);

    /**
     * Gets profile details of the currently authenticated user.
     */
    UserDto getCurrentUserProfile(String currentUsername);
}
