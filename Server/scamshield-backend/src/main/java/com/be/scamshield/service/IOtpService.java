package com.be.scamshield.service;

public interface IOtpService {
    void sendEmailOtp(String email);
    void sendPhoneOtp(String phoneNumber);
    boolean verifyOtp(String target, String otpCode, String type);
}
