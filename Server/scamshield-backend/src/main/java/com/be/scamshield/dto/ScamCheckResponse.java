package com.be.scamshield.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScamCheckResponse {
    private boolean isScam;
    private double confidenceScore;
    private String message;

    @JsonProperty("isScam")
    public boolean isScam() {
        return isScam;
    }
}
