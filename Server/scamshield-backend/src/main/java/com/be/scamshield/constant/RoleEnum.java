package com.be.scamshield.constant;

import java.util.Arrays;

public enum RoleEnum {

    GUEST(1),
    REGISTERED_USER(2),
    MODERATOR(3),
    ADMINISTRATOR(4),
    BUSINESS_PARTNER(5);

    private final int id;

    RoleEnum(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public static RoleEnum fromId(int id) {
        return Arrays.stream(values())
                .filter(r -> r.id == id)
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("Unknown role id: " + id)
                );
    }
}
