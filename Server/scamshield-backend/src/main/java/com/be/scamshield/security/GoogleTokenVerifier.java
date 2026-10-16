package com.be.scamshield.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Collections;

@Component
@Slf4j
public class GoogleTokenVerifier {

    @Value("${google.client.id:your-google-client-id}")
    private String googleClientId;

    public GoogleIdToken.Payload verify(String idTokenString) {
        if (!StringUtils.hasText(idTokenString)) {
            return null;
        }

        try {
            GoogleIdTokenVerifier.Builder builder = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    new GsonFactory()
            );

            if (StringUtils.hasText(googleClientId) && !"your-google-client-id".equalsIgnoreCase(googleClientId.trim())) {
                builder.setAudience(Collections.singletonList(googleClientId.trim()));
            }

            GoogleIdTokenVerifier verifier = builder.build();
            GoogleIdToken idToken = verifier.verify(idTokenString.trim());
            if (idToken != null) {
                return idToken.getPayload();
            }
            log.warn("Google token verification returned null for provided token");
            return null;
        } catch (Exception e) {
            log.error("Google token verification failed: {}", e.getMessage());
            return null;
        }
    }
}
