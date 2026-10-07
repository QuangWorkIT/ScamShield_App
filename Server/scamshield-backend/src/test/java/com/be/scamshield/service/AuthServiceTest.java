package com.be.scamshield.service;

import com.be.scamshield.dto.*;
import com.be.scamshield.entity.RefreshToken;
import com.be.scamshield.entity.Role;
import com.be.scamshield.entity.User;
import com.be.scamshield.exception.BadRequestException;
import com.be.scamshield.repository.RefreshTokenRepository;
import com.be.scamshield.repository.UserRepository;
import com.be.scamshield.security.JwtTokenProvider;
import com.be.scamshield.security.UserPrincipal;
import com.be.scamshield.serviceImpl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;
    private Role sampleRole;

    @BeforeEach
    void setUp() {
        sampleRole = Role.builder().id(1L).name("REGISTERED_USER").build();
        sampleUser = User.builder()
                .id(1L)
                .email("testuser@example.com")
                .passwordHash("encodedOldPassword")
                .role(sampleRole)
                .status("ACTIVE")
                .reputationPoints(0)
                .isPhoneVerified(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest("testuser@example.com", "Password123!");
        Authentication authentication = mock(Authentication.class);
        UserPrincipal principal = UserPrincipal.create(sampleUser);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(principal);
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(tokenProvider.generateAccessToken(authentication)).thenReturn("mockAccessToken");
        when(tokenProvider.generateRefreshToken()).thenReturn("mockRefreshToken");

        AuthResponse response = authService.login(request, null);

        assertNotNull(response);
        assertEquals("mockAccessToken", response.getAccessToken());
    }

    @Test
    void refreshToken_Success() {
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .id(1L)
                .user(sampleUser)
                .tokenHash("hashedToken")
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(refreshTokenEntity));
        when(tokenProvider.generateAccessTokenForUser(1L, "testuser@example.com", "testuser@example.com", "REGISTERED_USER")).thenReturn("newAccessToken");

        AuthResponse response = authService.refreshToken("valid_refresh_token", null);

        assertNotNull(response);
        assertEquals("newAccessToken", response.getAccessToken());
    }

    @Test
    void changePassword_Success() {
        ChangePasswordRequest request = new ChangePasswordRequest("OldPassword123!", "NewPassword456!");

        when(userRepository.findByEmailOrPhoneNumber("testuser@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("OldPassword123!", "encodedOldPassword")).thenReturn(true);
        when(passwordEncoder.encode("NewPassword456!")).thenReturn("encodedNewPassword");

        authService.changePassword("testuser@example.com", request);

        verify(userRepository, times(1)).save(sampleUser);
        verify(refreshTokenRepository, times(1)).deleteByUser(sampleUser);
        assertEquals("encodedNewPassword", sampleUser.getPasswordHash());
    }

    @Test
    void changePassword_WrongOldPassword_ThrowsException() {
        ChangePasswordRequest request = new ChangePasswordRequest("WrongPassword", "NewPassword456!");

        when(userRepository.findByEmailOrPhoneNumber("testuser@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("WrongPassword", "encodedOldPassword")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> authService.changePassword("testuser@example.com", request));
    }
}
