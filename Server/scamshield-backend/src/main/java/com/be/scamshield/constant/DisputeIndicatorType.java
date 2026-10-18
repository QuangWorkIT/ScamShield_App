package com.be.scamshield.constant;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Loại chỉ số cần khiếu nại: số điện thoại, tài khoản ngân hàng, website hoặc SMS Brandname")
public enum DisputeIndicatorType {
    PHONE,
    BANK_ACCOUNT,
    URL,
    BRANDNAME
}
