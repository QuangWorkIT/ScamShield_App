package com.be.scamshield.serviceImpl;

import com.be.scamshield.constant.RoleEnum;
import com.be.scamshield.constant.UserStatus;
import com.be.scamshield.dto.*;
import com.be.scamshield.dto.request.RegisterPersonalRequest;
import com.be.scamshield.entity.RefreshToken;
import com.be.scamshield.entity.Role;
import com.be.scamshield.entity.User;
import com.be.scamshield.exception.BadRequestException;
import com.be.scamshield.exception.ResourceNotFoundException;
import com.be.scamshield.exception.UnauthorizedException;
import com.be.scamshield.repository.RefreshTokenRepository;
import com.be.scamshield.repository.RoleRepository;
import com.be.scamshield.repository.UserRepository;
import com.be.scamshield.security.JwtTokenProvider;
import com.be.scamshield.security.UserPrincipal;
import com.be.scamshield.service.IAuthService;
import com.be.scamshield.service.IOtpService;
import com.be.scamshield.service.IUserAlertSubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements IAuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final IUserAlertSubscriptionService subscriptionService;
    private final IOtpService otpService;

    @Override
    @Transactional
    public void registerPersonal(RegisterPersonalRequest request) {
        if (!request.isAgreeTerms()) {
            throw new IllegalArgumentException("You must agree to the terms.");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists.");
        }
        if (userRepository.findByPhoneNumber(request.getPhoneNumber()).isPresent()) {
            throw new IllegalArgumentException("Phone number already exists.");
        }

        // Verify Email OTP
        otpService.verifyOtp(request.getEmail(), request.getEmailOtp(), "EMAIL");

        Role userRole = roleRepository.findByName(RoleEnum.REGISTERED_USER.name())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        User newUser = User.builder()
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .status(UserStatus.ACTIVE.name())
                .reputationPoints(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(newUser);

        if (request.isReceiveAlerts()) {
            subscriptionService.subscribeAllCategories(newUser);
        }
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Authenticate using email, phone number, or username
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrPhoneNumber(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userPrincipal.getId()));

        if ("BANNED".equalsIgnoreCase(user.getStatus()) || "INACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new UnauthorizedException("Your account is " + user.getStatus().toLowerCase() + ". Please contact support.");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken();

        refreshTokenRepository.deleteByUser(user);
        saveRefreshToken(user, refreshToken);

        log.info("User logged in successfully: {}", user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String tokenHash = hashToken(request.getRefreshToken());

        RefreshToken refreshTokenEntity = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid or revoked refresh token"));

        if (refreshTokenEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshTokenEntity);
            throw new UnauthorizedException("Refresh token has expired. Please login again.");
        }

        User user = refreshTokenEntity.getUser();
        String roleName = user.getRole() != null ? user.getRole().getName() : "REGISTERED_USER";
        String newAccessToken = tokenProvider.generateAccessTokenForUser(user.getId(), user.getUsername(), user.getEmail(), roleName);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(request.getRefreshToken())
                .build();
    }

    @Override
    @Transactional
    public void changePassword(String currentUsername, ChangePasswordRequest request) {
        User user = findUserByUsernameOrEmailOrPhone(currentUsername);

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match!");
        }

        if (request.getOldPassword().equals(request.getNewPassword())) {
            throw new BadRequestException("New password cannot be the same as the current password!");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        refreshTokenRepository.deleteByUser(user);
        log.info("Password successfully updated for user: {}", currentUsername);
    }

    @Override
    @Transactional
    public void logout(String refreshToken, String currentUsername) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            String tokenHash = hashToken(refreshToken);
            refreshTokenRepository.deleteByTokenHash(tokenHash);
        }

        if (currentUsername != null && !currentUsername.isBlank()) {
            userRepository.findByEmail(currentUsername)
                    .or(() -> userRepository.findByPhoneNumber(currentUsername))
                    .ifPresent(refreshTokenRepository::deleteByUser);
        }

        SecurityContextHolder.clearContext();
        log.info("User logged out successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUserProfile(String currentUsername) {
        User user = findUserByUsernameOrEmailOrPhone(currentUsername);
        return mapToUserDto(user);
    }

    private User findUserByUsernameOrEmailOrPhone(String identifier) {
        return userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByPhoneNumber(identifier))
                .or(() -> userRepository.findByUsername(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + identifier));
    }

    private void saveRefreshToken(User user, String refreshTokenStr) {
        String tokenHash = hashToken(refreshTokenStr);
        LocalDateTime expiresAt = LocalDateTime.now().plusNanos(tokenProvider.getRefreshExpirationInMs() * 1_000_000L);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .build();

        refreshTokenRepository.save(refreshToken);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return token;
        }
    }

    private UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .isPhoneVerified(user.getIsPhoneVerified() != null ? user.getIsPhoneVerified() : false)
                .role(user.getRole() != null ? user.getRole().getName() : "REGISTERED_USER")
                .status(user.getStatus())
                .reputationPoints(user.getReputationPoints())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
