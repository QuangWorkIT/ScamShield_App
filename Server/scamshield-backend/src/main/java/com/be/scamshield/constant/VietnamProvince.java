package com.be.scamshield.constant;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;
import java.util.Optional;

/** Mã tỉnh theo Phụ lục I, Quyết định 19/2025/QĐ-TTg (áp dụng từ 01/07/2025). */
@Getter
@RequiredArgsConstructor
public enum VietnamProvince {
    HA_NOI("01", "Hà Nội"),
    CAO_BANG("04", "Cao Bằng"),
    TUYEN_QUANG("08", "Tuyên Quang"),
    DIEN_BIEN("11", "Điện Biên"),
    LAI_CHAU("12", "Lai Châu"),
    SON_LA("14", "Sơn La"),
    LAO_CAI("15", "Lào Cai"),
    THAI_NGUYEN("19", "Thái Nguyên"),
    LANG_SON("20", "Lạng Sơn"),
    QUANG_NINH("22", "Quảng Ninh"),
    BAC_NINH("24", "Bắc Ninh"),
    PHU_THO("25", "Phú Thọ"),
    HAI_PHONG("31", "Hải Phòng"),
    HUNG_YEN("33", "Hưng Yên"),
    NINH_BINH("37", "Ninh Bình"),
    THANH_HOA("38", "Thanh Hóa"),
    NGHE_AN("40", "Nghệ An"),
    HA_TINH("42", "Hà Tĩnh"),
    QUANG_TRI("44", "Quảng Trị"),
    HUE("46", "Huế"),
    DA_NANG("48", "Đà Nẵng"),
    QUANG_NGAI("51", "Quảng Ngãi"),
    GIA_LAI("52", "Gia Lai"),
    KHANH_HOA("56", "Khánh Hòa"),
    DAK_LAK("66", "Đắk Lắk"),
    LAM_DONG("68", "Lâm Đồng"),
    DONG_NAI("75", "Đồng Nai"),
    HO_CHI_MINH("79", "TP. Hồ Chí Minh"),
    TAY_NINH("80", "Tây Ninh"),
    DONG_THAP("82", "Đồng Tháp"),
    VINH_LONG("86", "Vĩnh Long"),
    AN_GIANG("91", "An Giang"),
    CAN_THO("92", "Cần Thơ"),
    CA_MAU("96", "Cà Mau");

    private final String code;
    private final String name;

    public static Optional<VietnamProvince> fromCode(String code) {
        return Arrays.stream(values()).filter(province -> province.code.equals(code)).findFirst();
    }
}
