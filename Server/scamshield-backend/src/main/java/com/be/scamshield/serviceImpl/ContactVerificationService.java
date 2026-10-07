package com.be.scamshield.serviceImpl;

import com.be.scamshield.dto.request.VerifyContactsRequest;
import com.be.scamshield.dto.response.ContactVerificationResponse;
import com.be.scamshield.entity.ContactVerification;
import com.be.scamshield.exception.BadRequestException;
import com.be.scamshield.exception.RegistrationConflictException;
import com.be.scamshield.repository.ContactVerificationRepository;
import com.be.scamshield.repository.UserRepository;
import com.be.scamshield.service.IOtpService;
import com.be.scamshield.util.VietnamPhoneNumbers;
import lombok.RequiredArgsConstructor;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.net.IDN;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ContactVerificationService {
    private static final SecureRandom TOKEN_RANDOM = new SecureRandom();
    private final UserRepository userRepository;
    private final IOtpService otpService;
    private final ContactVerificationRepository verificationRepository;
    private final Clock applicationClock;

    @Value("${app.contact-verification.expiration-ms}")
    private long verificationExpirationMs;

    @PostConstruct
    void validateExpiration() {
        if (verificationExpirationMs <= 0) {
            throw new IllegalArgumentException("Thời gian hết hạn Token xác nhận điện thoại phải lớn hơn 0 ms");
        }
    }

    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public ContactVerificationResponse verifyContacts(VerifyContactsRequest request) {
        String phone = VietnamPhoneNumbers.nationalMobile(request.getPhoneNumber());
        if (userRepository.findByPhoneNumber(phone).isPresent()) {
            throw new RegistrationConflictException("Số điện thoại đã được dùng cho một tài khoản");
        }
        otpService.verifyPhoneOtp(phone, request.getPhoneOtp());
        byte[] bytes = new byte[32];
        TOKEN_RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        LocalDateTime expiresAt = LocalDateTime.now(applicationClock).plus(Duration.ofMillis(verificationExpirationMs));
        verificationRepository.saveAndFlush(ContactVerification.builder()
                .tokenHash(hashToken(token)).phoneNumber(phone).expiresAt(expiresAt).build());
        return new ContactVerificationResponse(token, expiresAt);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void consume(String token, String phone) {
        if (token == null || !token.matches("[A-Za-z0-9_-]{43}")) {
            throw new BadRequestException("Cần xác thực điện thoại trước khi đăng ký");
        }
        ContactVerification verification = verificationRepository.findLockedByTokenHash(hashToken(token))
                .orElseThrow(() -> new BadRequestException("Mã xác nhận điện thoại không hợp lệ"));
        LocalDateTime now = LocalDateTime.now(applicationClock);
        if (verification.getUsedAt() != null || !verification.getExpiresAt().isAfter(now)) {
            throw new BadRequestException("Mã xác nhận đã dùng hoặc hết hạn; vui lòng xác thực lại");
        }
        if (!verification.getPhoneNumber().equals(VietnamPhoneNumbers.nationalMobile(phone))) {
            throw new BadRequestException("Số điện thoại đã thay đổi; vui lòng xác thực lại");
        }
        verification.setUsedAt(now);
        verificationRepository.saveAndFlush(verification);
    }

    private String hashToken(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("Không thể tạo mã xác nhận", ex);
        }
    }

    public String normalizeEmail(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Email không được để trống");
        }
        String email = value.trim().toLowerCase(Locale.ROOT);
        int at = email.lastIndexOf('@');
        if (at <= 0 || at != email.indexOf('@')) {
            throw new BadRequestException("Email không đúng định dạng");
        }
        email = email.substring(0, at + 1) + IDN.toASCII(email.substring(at + 1), IDN.USE_STD3_ASCII_RULES).toLowerCase(Locale.ROOT);
        if (email.length() > 254) {
            throw new BadRequestException("Email sau chuẩn hóa không được vượt quá 254 ký tự");
        }
        return email;
    }

}
