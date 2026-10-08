package com.be.scamshield.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "firebase.phone")
public class FirebasePhoneProperties {
    private String apiKey = "";

    @Min(1)
    @Max(10)
    private int maxRequestsPer24Hours = 10;
}
