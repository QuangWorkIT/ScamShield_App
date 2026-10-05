package com.be.scamshield.serviceImpl;

import com.be.scamshield.entity.OtpVerification;
import com.be.scamshield.repository.OtpVerificationRepository;
import com.be.scamshield.service.IOtpService;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StreamUtils;
import java.nio.charset.StandardCharsets;
import java.io.IOException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements IOtpService {

    private final OtpVerificationRepository otpVerificationRepository;
    private final JavaMailSender mailSender;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Value("${twilio.account.sid:default_sid}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token:default_token}")
    private String twilioAuthToken;

    @Value("${twilio.phone.number:default_phone}")
    private String twilioPhoneNumber;

    @Value("${spring.mail.username:default_email}")
    private String fromEmail;

    @Value("${spring.mail.display-name:ScamShield}")
    private String mailDisplayName;

    private String generateOtp() {
        return String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
    }

    private String getHtmlTemplate() {
        try {
            ClassPathResource resource = new ClassPathResource("templates/otp-email.html");
            return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            return "<p>Mã OTP của bạn là: <b>{{OTP_CODE}}</b></p>";
        }
    }

    private void checkRateLimit(String target, String type) {
        Optional<OtpVerification> lastOtpOpt = otpVerificationRepository.findTopByTargetAndTypeOrderByIdDesc(target, type);
        if (lastOtpOpt.isPresent()) {
            OtpVerification lastOtp = lastOtpOpt.get();
            if (lastOtp.getCreatedAt().plusMinutes(1).isAfter(LocalDateTime.now())) {
                throw new IllegalArgumentException("Vui lòng đợi 1 phút trước khi yêu cầu mã mới.");
            }
        }
    }

    @Override
    @Transactional
    public void sendEmailOtp(String email) {
        checkRateLimit(email, "EMAIL");
        String otp = generateOtp();

        OtpVerification otpVerification = OtpVerification.builder()
                .target(email)
                .otpCode(otp)
                .type("EMAIL")
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .isVerified(false)
                .failedAttempts(0)
                .build();
        otpVerificationRepository.save(otpVerification);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, mailDisplayName);
            helper.setTo(email);
            helper.setSubject("Mã xác thực ScamShield");
            
            String htmlContent = getHtmlTemplate().replace("{{OTP_CODE}}", otp);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException | org.springframework.mail.MailException e) {
            throw new RuntimeException("Lỗi khi gửi email: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void sendPhoneOtp(String phoneNumber) {
        checkRateLimit(phoneNumber, "PHONE");
        String otp = generateOtp();

        OtpVerification otpVerification = OtpVerification.builder()
                .target(phoneNumber)
                .otpCode(otp)
                .type("PHONE")
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .isVerified(false)
                .failedAttempts(0)
                .build();
        otpVerificationRepository.save(otpVerification);

        Twilio.init(twilioAccountSid, twilioAuthToken);
        Message.creator(
                new PhoneNumber(phoneNumber),
                new PhoneNumber(twilioPhoneNumber),
                "Mã OTP ScamShield của bạn là: " + otp
        ).create();
    }

    @Override
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW, noRollbackFor = IllegalArgumentException.class)
    public boolean verifyOtp(String target, String otpCode, String type) {
        Optional<OtpVerification> otpVerificationOpt = otpVerificationRepository
                .findTopByTargetAndTypeOrderByIdDesc(target, type);

        if (otpVerificationOpt.isPresent()) {
            OtpVerification otpVerification = otpVerificationOpt.get();
            
            if (otpVerification.isVerified()) {
                throw new IllegalArgumentException("Vui lòng gửi yêu cầu lấy mã OTP mới");
            }

            if (otpVerification.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("Vui lòng gửi yêu cầu lấy mã OTP mới");
            }

            if (otpVerification.getFailedAttempts() >= 5) {
                throw new IllegalArgumentException("Vui lòng gửi yêu cầu lấy mã OTP mới");
            }

            if (otpVerification.getOtpCode().equals(otpCode)) {
                otpVerification.setVerified(true);
                otpVerificationRepository.save(otpVerification);
                return true;
            } else {
                otpVerification.setFailedAttempts(otpVerification.getFailedAttempts() + 1);
                otpVerificationRepository.save(otpVerification);
                int attemptsLeft = 5 - otpVerification.getFailedAttempts();
                if (attemptsLeft > 0) {
                    throw new IllegalArgumentException("Mã OTP không chính xác. Bạn còn " + attemptsLeft + " lần thử.");
                } else {
                    throw new IllegalArgumentException("Mã OTP đã bị vô hiệu hóa do nhập sai quá 5 lần. Vui lòng yêu cầu mã mới.");
                }
            }
        }
        
        throw new IllegalArgumentException("Chưa có yêu cầu gửi mã OTP nào cho thiết bị này");
    }
}
