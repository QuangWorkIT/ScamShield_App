package com.be.scamshield.serviceImpl;

import com.be.scamshield.entity.OtpVerification;
import com.be.scamshield.repository.OtpVerificationRepository;
import com.be.scamshield.service.IOtpService;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StreamUtils;
import java.nio.charset.StandardCharsets;
import java.io.IOException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements IOtpService {

    private final OtpVerificationRepository otpVerificationRepository;
    private final JavaMailSender mailSender;

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
        return String.format("%06d", new Random().nextInt(999999));
    }

    private String getHtmlTemplate() {
        try {
            ClassPathResource resource = new ClassPathResource("templates/otp-email.html");
            return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            // Fallback nếu không tìm thấy file
            return "<p>Mã OTP của bạn là: <b>{{OTP_CODE}}</b></p>";
        }
    }

    @Override
    public void sendEmailOtp(String email) {
        String otp = generateOtp();

        // Lưu DB
        OtpVerification otpVerification = OtpVerification.builder()
                .target(email)
                .otpCode(otp)
                .type("EMAIL")
                .expiresAt(LocalDateTime.now().plusMinutes(5)) // Hết hạn sau 5 phút
                .isVerified(false)
                .build();
        otpVerificationRepository.save(otpVerification);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, mailDisplayName);
            helper.setTo(email);
            helper.setSubject("Mã xác thực ScamShield");
            
            // Đọc file HTML template và thay thế placeholder {{OTP_CODE}} bằng mã thật
            String htmlContent = getHtmlTemplate().replace("{{OTP_CODE}}", otp);
            
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException("Lỗi khi gửi email: " + e.getMessage());
        }
    }

    @Override
    public void sendPhoneOtp(String phoneNumber) {
        String otp = generateOtp();

        // Lưu DB
        OtpVerification otpVerification = OtpVerification.builder()
                .target(phoneNumber)
                .otpCode(otp)
                .type("PHONE")
                .expiresAt(LocalDateTime.now().plusMinutes(5)) // Hết hạn sau 5 phút
                .isVerified(false)
                .build();
        otpVerificationRepository.save(otpVerification);

        // Gửi qua SMS (Sử dụng thư viện production-ready: Twilio)
        Twilio.init(twilioAccountSid, twilioAuthToken);
        Message.creator(
                new PhoneNumber(phoneNumber), // To
                new PhoneNumber(twilioPhoneNumber), // From
                "Mã OTP ScamShield của bạn là: " + otp
        ).create();
    }

    @Override
    public boolean verifyOtp(String target, String otpCode, String type) {
        Optional<OtpVerification> otpVerificationOpt = otpVerificationRepository
                .findByTargetAndOtpCodeAndType(target, otpCode, type);

        if (otpVerificationOpt.isPresent()) {
            OtpVerification otpVerification = otpVerificationOpt.get();
            
            if (otpVerification.isVerified()) {
                throw new IllegalArgumentException("Mã OTP này đã được sử dụng");
            }
            
            if (otpVerification.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("Mã OTP đã hết hạn");
            }

            // Đánh dấu là đã xác thực
            otpVerification.setVerified(true);
            otpVerificationRepository.save(otpVerification);
            return true;
        }
        
        throw new IllegalArgumentException("Mã OTP không chính xác");
    }
}
