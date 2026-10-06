package com.be.scamshield.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Login Request Payload")
public class LoginRequest {

    @NotBlank(message = "Username or phone number is required")
    @Schema(description = "Username or Phone Number", example = "user01")
    private String usernameOrPhoneNumber;

    @NotBlank(message = "Password is required")
    @Schema(description = "Password", example = "Secret123!")
    private String password;
}
