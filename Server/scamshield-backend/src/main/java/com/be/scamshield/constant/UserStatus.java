package com.be.scamshield.constant;

import java.util.Arrays;

public enum UserStatus {

    ACTIVE(1),
    INACTIVE(2),
    SUSPENDED(3),
    BANNED(4);

    private final int id;

    UserStatus(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public static UserStatus fromId(int id) {
        return Arrays.stream(values())
                .filter(s -> s.id == id)
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("Unknown UserStatus id: " + id)
                );
    }
}
