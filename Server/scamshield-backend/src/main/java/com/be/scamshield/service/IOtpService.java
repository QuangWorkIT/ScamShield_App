package com.be.scamshield.service;

import com.be.scamshield.constant.OtpType;

public interface IOtpService {
    void sendEmailOtp(String email);
    void sendPhoneOtp(String phoneNumber, String recaptchaToken);
    boolean verifyContactOtps(String email, String emailCode, String phone, String phoneCode);
    boolean verifyOtp(String target, String otpCode, OtpType type);
}
