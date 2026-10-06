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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.net.IDN;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
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

    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public ContactVerificationResponse verifyContacts(VerifyContactsRequest request) {
        String email = normalizeEmail(request.getEmail());
        String phone = VietnamPhoneNumbers.nationalMobile(request.getPhoneNumber());
        if (userRepository.existsByEmailIgnoreCase(email) || userRepository.findByPhoneNumber(phone).isPresent()) {
            throw new RegistrationConflictException("Email hoặc số điện thoại đã được dùng cho một tài khoản");
        }
        if (!otpService.verifyContactOtps(email, request.getEmailOtp(), phone, request.getPhoneOtp())) {
            throw new IllegalArgumentException("OTP email hoặc điện thoại không hợp lệ");
        }
        byte[] bytes = new byte[32];
        TOKEN_RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        LocalDateTime expiresAt = LocalDateTime.now(applicationClock).plusMinutes(10);
        verificationRepository.saveAndFlush(ContactVerification.builder()
                .tokenHash(hashToken(token)).email(email).phoneNumber(phone).expiresAt(expiresAt).build());
        return new ContactVerificationResponse(token, expiresAt);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void consume(String token, String email, String phone) {
        if (token == null || !token.matches("[A-Za-z0-9_-]{43}")) {
            throw new BadRequestException("Cần xác thực email và điện thoại trước khi đăng ký");
        }
        ContactVerification verification = verificationRepository.findLockedByTokenHash(hashToken(token))
                .orElseThrow(() -> new BadRequestException("Mã xác nhận liên hệ không hợp lệ"));
        LocalDateTime now = LocalDateTime.now(applicationClock);
        if (verification.getUsedAt() != null || !verification.getExpiresAt().isAfter(now)) {
            throw new BadRequestException("Mã xác nhận đã dùng hoặc hết hạn; vui lòng xác thực lại");
        }
        if (!verification.getEmail().equals(email) || !verification.getPhoneNumber().equals(phone)) {
            throw new BadRequestException("Email hoặc điện thoại đã thay đổi; vui lòng xác thực lại");
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
