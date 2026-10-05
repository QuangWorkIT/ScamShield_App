package com.be.scamshield.serviceImpl;

import com.be.scamshield.constant.RoleEnum;
import com.be.scamshield.constant.UserStatus;
import com.be.scamshield.dto.request.RegisterPersonalRequest;
import com.be.scamshield.entity.Role;
import com.be.scamshield.entity.User;
import com.be.scamshield.repository.RoleRepository;
import com.be.scamshield.repository.UserRepository;
import com.be.scamshield.service.IAuthService;
import com.be.scamshield.service.IOtpService;
import com.be.scamshield.service.IUserAlertSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final IUserAlertSubscriptionService subscriptionService;
    private final IOtpService otpService;

    @Override
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

        // Xác thực OTP
        otpService.verifyOtp(request.getEmail(), request.getEmailOtp(), "EMAIL");
        // Tạm thời bỏ qua xác thực Phone OTP
        // otpService.verifyOtp(request.getPhoneNumber(), request.getPhoneOtp(), "PHONE");
        
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
}
