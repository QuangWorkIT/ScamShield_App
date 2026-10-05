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
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import com.be.scamshield.dto.request.RegisterGoogleRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

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

        User savedUser = userRepository.save(newUser);

        if (request.isReceiveAlerts()) {
            subscriptionService.subscribeAllCategories(savedUser);
        }
    }

    @Value("${google.client.id:your-google-client-id}")
    private String googleClientId;

    @Override
    public void registerGoogle(RegisterGoogleRequest request) {
        if (!request.isAgreeTerms()) {
            throw new IllegalArgumentException("You must agree to the terms.");
        }

        // Kiểm tra xem số điện thoại đã tồn tại chưa
        if (userRepository.findByPhoneNumber(request.getPhoneNumber()).isPresent()) {
            throw new IllegalArgumentException("Phone number already exists.");
        }

        try {
            // Khởi tạo GoogleIdTokenVerifier
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    // Tạm thời comment dòng dưới lại nếu muốn test mà chưa có Client ID thật, 
                    // nhưng khi lên Production bắt buộc phải set Audience để bảo mật.
                    // .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();

                // Trích xuất thông tin từ token Google
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                // Kiểm tra email đã tồn tại trong hệ thống chưa
                if (userRepository.findByEmail(email).isPresent()) {
                    throw new IllegalArgumentException("Email already exists in the system. Please login instead.");
                }

                // Gán quyền REGISTERED_USER
                Role userRole = roleRepository.findByName(RoleEnum.REGISTERED_USER.name())
                        .orElseThrow(() -> new RuntimeException("Role not found"));

                // Tạo mật khẩu ngẫu nhiên (vì user login qua Google)
                String randomPassword = UUID.randomUUID().toString();

                User user = User.builder()
                        .fullName(name)
                        .phoneNumber(request.getPhoneNumber())
                        .email(email)
                        .passwordHash(passwordEncoder.encode(randomPassword))
                        .role(userRole)
                        .status("ACTIVE")
                        .reputationPoints(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

                User savedUser = userRepository.save(user);

                if (request.isReceiveAlerts()) {
                    subscriptionService.subscribeAllCategories(savedUser);
                }

            } else {
                throw new IllegalArgumentException("Invalid Google ID token.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi xác thực Google Token: " + e.getMessage());
        }
    }
}
