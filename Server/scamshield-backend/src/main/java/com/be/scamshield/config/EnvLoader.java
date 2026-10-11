package com.be.scamshield.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;

@Slf4j
public class EnvLoader {

    private static final Map<String, Object> CACHED_PROPERTIES = new HashMap<>();
    private static boolean loaded = false;

    public static synchronized Map<String, Object> loadEnv() {
        if (loaded && !CACHED_PROPERTIES.isEmpty()) {
            return CACHED_PROPERTIES;
        }

        File envFile = resolveEnvFile();
        if (envFile != null && envFile.exists()) {
            log.info("[EnvLoader] Loading environment variables from file: {}", envFile.getAbsolutePath());
            try (BufferedReader reader = Files.newBufferedReader(envFile.toPath(), StandardCharsets.UTF_8)) {
                parseAndApply(reader);
            } catch (Exception e) {
                log.error("[EnvLoader] Failed to read .env file from {}: {}", envFile.getAbsolutePath(), e.getMessage());
            }
        } else {
            // Fallback to classpath /.env
            try (InputStream is = EnvLoader.class.getResourceAsStream("/.env")) {
                if (is != null) {
                    log.info("[EnvLoader] Loading environment variables from classpath: /.env");
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                        parseAndApply(reader);
                    }
                } else {
                    log.warn("[EnvLoader] No .env file found in filesystem or classpath.");
                }
            } catch (Exception e) {
                log.error("[EnvLoader] Failed to read .env from classpath: {}", e.getMessage());
            }
        }

        loaded = true;
        return CACHED_PROPERTIES;
    }

    private static File resolveEnvFile() {
        String userDir = System.getProperty("user.dir");
        if (StringUtils.hasText(userDir)) {
            File current = new File(userDir);

            // 1. Direct checks in working directory
            File[] directCandidates = new File[] {
                    new File(current, ".env"),
                    new File(current, "Server/scamshield-backend/.env"),
                    new File(current, "scamshield-backend/.env")
            };
            for (File candidate : directCandidates) {
                if (candidate.exists()) {
                    return candidate;
                }
            }

            // 2. Search upward in parent directories
            File parent = current.getParentFile();
            while (parent != null) {
                File candidate1 = new File(parent, ".env");
                if (candidate1.exists()) {
                    return candidate1;
                }
                File candidate2 = new File(parent, "Server/scamshield-backend/.env");
                if (candidate2.exists()) {
                    return candidate2;
                }
                parent = parent.getParentFile();
            }
        }
        return null;
    }

    private static void parseAndApply(BufferedReader reader) throws Exception {
        String line;
        while ((line = reader.readLine()) != null) {
            line = line.trim();
            if (line.isEmpty() || line.startsWith("#")) {
                continue;
            }
            int eqIdx = line.indexOf('=');
            if (eqIdx > 0) {
                String key = line.substring(0, eqIdx).trim();
                String value = line.substring(eqIdx + 1).trim();

                // Strip quotes if any
                if ((value.startsWith("\"") && value.endsWith("\"")) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length() - 1);
                }

                CACHED_PROPERTIES.put(key, value);
                // Always set System property so it can be referenced everywhere
                System.setProperty(key, value);
            }
        }
    }
}
