package com.be.scamshield.service;

import com.be.scamshield.dto.*;
import com.be.scamshield.dto.request.LoginGoogleRequest;
import com.be.scamshield.entity.RefreshToken;
import com.be.scamshield.entity.Role;
import com.be.scamshield.entity.User;
import com.be.scamshield.exception.BadRequestException;
import com.be.scamshield.exception.ResourceNotFoundException;
import com.be.scamshield.exception.UnauthorizedException;
import com.be.scamshield.repository.RefreshTokenRepository;
import com.be.scamshield.repository.UserRepository;
import com.be.scamshield.security.GoogleTokenVerifier;
import com.be.scamshield.security.JwtTokenProvider;
import com.be.scamshield.security.UserPrincipal;
import com.be.scamshield.serviceImpl.AuthServiceImpl;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
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
    @Mock
    private GoogleTokenVerifier googleTokenVerifier;

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

    @Test
    void loginGoogle_Success() {
        LoginGoogleRequest request = new LoginGoogleRequest("valid_google_token");
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail("testuser@example.com");
        payload.set("name", "Test User");

        when(googleTokenVerifier.verify("valid_google_token")).thenReturn(payload);
        when(userRepository.findByEmail("testuser@example.com")).thenReturn(Optional.of(sampleUser));
        when(tokenProvider.generateAccessTokenForUser(1L, "testuser@example.com", "testuser@example.com", "REGISTERED_USER"))
                .thenReturn("mockGoogleAccessToken");
        when(tokenProvider.generateRefreshToken()).thenReturn("mockGoogleRefreshToken");

        AuthResponse response = authService.loginGoogle(request, null);

        assertNotNull(response);
        assertEquals("mockGoogleAccessToken", response.getAccessToken());
        verify(userRepository, times(1)).save(sampleUser);
        verify(refreshTokenRepository, times(1)).deleteByUser(sampleUser);
    }

    @Test
    void loginGoogle_UserNotFound_ThrowsResourceNotFoundException() {
        LoginGoogleRequest request = new LoginGoogleRequest("unregistered_token");
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail("notfound@example.com");

        when(googleTokenVerifier.verify("unregistered_token")).thenReturn(payload);
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.loginGoogle(request, null));
    }

    @Test
    void loginGoogle_InvalidToken_ThrowsBadRequestException() {
        LoginGoogleRequest request = new LoginGoogleRequest("invalid_token");

        when(googleTokenVerifier.verify("invalid_token")).thenReturn(null);

        assertThrows(BadRequestException.class, () -> authService.loginGoogle(request, null));
    }

    @Test
    void loginGoogle_BannedUser_ThrowsUnauthorizedException() {
        LoginGoogleRequest request = new LoginGoogleRequest("banned_token");
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail("banned@example.com");

        User bannedUser = User.builder()
                .id(2L)
                .email("banned@example.com")
                .status("BANNED")
                .role(sampleRole)
                .build();

        when(googleTokenVerifier.verify("banned_token")).thenReturn(payload);
        when(userRepository.findByEmail("banned@example.com")).thenReturn(Optional.of(bannedUser));

        assertThrows(UnauthorizedException.class, () -> authService.loginGoogle(request, null));
    }
}
