package com.be.scamshield.serviceImpl;

import com.be.scamshield.constant.OtpType;
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
import com.be.scamshield.exception.OtpRateLimitException;
import com.be.scamshield.exception.SmsProviderException;
import com.be.scamshield.exception.BadRequestException;
import com.be.scamshield.exception.RegistrationConflictException;
import com.be.scamshield.util.VietnamPhoneNumbers;
import org.springframework.dao.DataIntegrityViolationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Clock;
import java.util.UUID;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import org.springframework.beans.factory.annotation.Value;
import com.be.scamshield.dto.request.RegisterGoogleRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final Clock applicationClock;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final IUserAlertSubscriptionService subscriptionService;
    private final IOtpService otpService;
    private final ContactVerificationService contactVerificationService;

    @Override
    @Transactional
    public void registerPersonal(RegisterPersonalRequest request) {
        if (!request.isAgreeTerms()) {
            throw new BadRequestException("Bạn phải đồng ý với điều khoản sử dụng");
        }
        String email = contactVerificationService.normalizeEmail(request.getEmail());
        String phone = VietnamPhoneNumbers.nationalMobile(request.getPhoneNumber());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new RegistrationConflictException("Email đã được dùng cho một tài khoản");
        }
        if (userRepository.findByPhoneNumber(phone).isPresent()) {
            throw new RegistrationConflictException("Số điện thoại đã được dùng cho một tài khoản");
        }
        if (request.getPassword() == null || request.getPassword().isBlank() || request.getPassword().length() < 6
                || request.getPassword().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new BadRequestException("Mật khẩu phải có ít nhất 6 ký tự và không vượt quá 72 byte UTF-8");
        }
        
        Role userRole = roleRepository.findByName(RoleEnum.REGISTERED_USER.name())
                .orElseThrow(() -> new IllegalStateException("Chưa cấu hình role REGISTERED_USER"));

        contactVerificationService.consume(request.getVerificationToken(), email, phone);

        User newUser = User.builder()
                .fullName(request.getFullName())
                .phoneNumber(phone)
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .status(UserStatus.ACTIVE.name())
                .reputationPoints(0)
                .createdAt(LocalDateTime.now(applicationClock))
                .updatedAt(LocalDateTime.now(applicationClock))
                .build();

        User savedUser;
        try {
            savedUser = userRepository.saveAndFlush(newUser);
        } catch (DataIntegrityViolationException ex) {
            if (ex.getMostSpecificCause() instanceof SQLException sql && "23505".equals(sql.getSQLState())) {
                throw new RegistrationConflictException("Email hoặc số điện thoại đã được dùng cho một tài khoản");
            }
            throw ex;
        }

        if (request.isReceiveAlerts()) {
            subscriptionService.subscribeAllCategories(savedUser);
        }
    }

    @Value("${google.client.id:your-google-client-id}")
    private String googleClientId;

    @Override
    @Transactional
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

                otpService.verifyOtp(request.getPhoneNumber(), request.getPhoneOtp(), OtpType.PHONE);

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
                        .createdAt(LocalDateTime.now(applicationClock))
                        .updatedAt(LocalDateTime.now(applicationClock))
                        .build();

                User savedUser = userRepository.save(user);

                if (request.isReceiveAlerts()) {
                    subscriptionService.subscribeAllCategories(savedUser);
                }

            } else {
                throw new IllegalArgumentException("Invalid Google ID token.");
            }
        } catch (IllegalArgumentException | OtpRateLimitException | SmsProviderException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi xác thực Google Token: " + e.getMessage());
        }
    }
}
