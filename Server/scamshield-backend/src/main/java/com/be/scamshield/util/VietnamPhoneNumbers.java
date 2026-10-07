package com.be.scamshield.util;

import com.be.scamshield.exception.BadRequestException;

public final class VietnamPhoneNumbers {
    private VietnamPhoneNumbers() { }

    public static String nationalMobile(String value) {
        if (value == null) {
            throw new BadRequestException("Số điện thoại không được để trống");
        }
        String phone = value.trim().replaceAll("[\\s().-]", "");
        if (phone.startsWith("+84")) {
            phone = "0" + phone.substring(3);
        }
        if (!phone.matches("^0[35789][0-9]{8}$")) {
            throw new BadRequestException("OTP SMS cần số di động Việt Nam hợp lệ, ví dụ 0912345678 hoặc +84912345678");
        }
        return phone;
    }

    public static String e164(String value) {
        return "+84" + nationalMobile(value).substring(1);
    }
}
