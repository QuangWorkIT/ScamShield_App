package com.be.scamshield.constant;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "OWNER: chủ sở hữu; LEGAL_REPRESENTATIVE: đại diện pháp luật; "
        + "AUTHORIZED_REPRESENTATIVE: người được ủy quyền. Đây là thông tin khai báo cần thẩm định.")
public enum DisputeLegalRelationship {
    OWNER,
    LEGAL_REPRESENTATIVE,
    AUTHORIZED_REPRESENTATIVE
}
