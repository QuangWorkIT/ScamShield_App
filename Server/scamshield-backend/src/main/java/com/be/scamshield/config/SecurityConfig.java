package com.be.scamshield.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.authorization.AuthorizationDecision;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, Environment environment) throws Exception {
        boolean testUiEnabled = environment.acceptsProfiles(Profiles.of("dev", "test"));
        http
            .csrf(AbstractHttpConfigurer::disable) // Tạm disable CSRF để test API dễ dàng
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/firebase-otp-test.html", "/firebase-otp-test.js")
                    .access((authentication, context) -> new AuthorizationDecision(testUiEnabled))
                .requestMatchers(HttpMethod.POST, "/api/auth/verify-contacts", "/api/partners/registrations", "/api/partners/registrations/verify-contacts").permitAll()
                .requestMatchers("/api/auth/**").permitAll() // Cho phép truy cập các API Auth không cần token
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll() // Cho phép truy cập Swagger UI
                .anyRequest().authenticated() // Bắt buộc đăng nhập với các API khác
            );
            
        return http.build();
    }
}
