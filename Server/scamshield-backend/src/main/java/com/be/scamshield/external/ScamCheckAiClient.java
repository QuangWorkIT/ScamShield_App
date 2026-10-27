package com.be.scamshield.external;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/** Calls the AI service with masked content only; never logs input or response bodies. */
@Component
@Slf4j
public class ScamCheckAiClient {
    private final ObjectMapper json;
    private final HttpClient http;
    private final URI endpoint;
    private final Duration timeout;
    private final boolean enabled;

    public ScamCheckAiClient(ObjectMapper json,
            @Value("${app.scam-check.ai.base-url:http://localhost:8000}") String baseUrl,
            @Value("${app.scam-check.ai.connect-timeout-ms:2000}") long connectTimeout,
            @Value("${app.scam-check.ai.request-timeout-ms:60000}") long requestTimeout,
            @Value("${app.scam-check.ai.enabled:true}") boolean enabled) {
        this.json = json;
        // Uvicorn's HTTP/1.1 server does not support Java's cleartext HTTP/2 upgrade.
        this.http = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofMillis(connectTimeout)).build();
        this.endpoint = URI.create(baseUrl.replaceAll("/+$", "") + "/api/v1/scan");
        this.timeout = Duration.ofMillis(requestTimeout);
        this.enabled = enabled;
    }

    public record Result(String verdict, String stage, BigDecimal confidence, String summary,
                         String guidance, String unknownReason, String scanId) {
        public static Result failure(String reason) {
            return new Result("UNKNOWN", "NONE", null,
                    "Chưa thể hoàn tất phân tích AI. Vui lòng thử lại sau.",
                    "Chưa xác định không có nghĩa là an toàn. Không chuyển tiền hoặc cung cấp OTP khi chưa xác minh.",
                    reason, null);
        }
    }

    public Result scan(Long checkId, String inputType, String maskedInput) {
        long started = System.nanoTime();
        if (!enabled) {
            log.warn("Scam check AI skipped: checkId={}, reason=AI_DISABLED", checkId);
            return Result.failure("AI_UNAVAILABLE");
        }
        String type = switch (inputType) {
            case "MESSAGE", "CALL_TRANSCRIPT" -> "TEXT";
            case "DOMAIN" -> "URL";
            default -> inputType;
        };
        try {
            log.info("Scam check AI request started: checkId={}, checkType={}, timeoutMs={}", checkId, type, timeout.toMillis());
            var request = HttpRequest.newBuilder(endpoint).timeout(timeout)
                    .header("Content-Type", "application/json")
                    .header("X-Core-Check-Id", String.valueOf(checkId))
                    .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(Map.of(
                            "content", maskedInput, "check_type", type, "force_tier2", false))))
                    .build();
            var response = http.send(request, HttpResponse.BodyHandlers.ofString());
            long elapsedMs = (System.nanoTime() - started) / 1_000_000;
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("Scam check AI HTTP failure: checkId={}, httpStatus={}, elapsedMs={}", checkId, response.statusCode(), elapsedMs);
                return Result.failure("AI_UNAVAILABLE");
            }
            var result = parse(response.body());
            if ("AI_INVALID_RESPONSE".equals(result.unknownReason())) {
                log.warn("Scam check AI invalid response: checkId={}, httpStatus={}, elapsedMs={}", checkId, response.statusCode(), elapsedMs);
            } else {
                log.info("Scam check AI response mapped: checkId={}, verdict={}, stage={}, confidence={}, unknownReason={}, httpStatus={}, elapsedMs={}",
                        checkId, result.verdict(), result.stage(), result.confidence(), result.unknownReason(), response.statusCode(), elapsedMs);
            }
            return result;
        } catch (HttpTimeoutException ex) {
            log.warn("Scam check AI timed out: checkId={}, elapsedMs={}", checkId, (System.nanoTime() - started) / 1_000_000);
            return Result.failure("AI_UNAVAILABLE");
        } catch (InterruptedException ex) {
            log.warn("Scam check AI interrupted: checkId={}", checkId);
            Thread.currentThread().interrupt();
            return Result.failure("AI_UNAVAILABLE");
        } catch (Exception ex) {
            log.warn("Scam check AI request failed: checkId={}, errorType={}, elapsedMs={}",
                    checkId, ex.getClass().getSimpleName(), (System.nanoTime() - started) / 1_000_000);
            return Result.failure("AI_UNAVAILABLE");
        }
    }

    Result parse(String body) {
        try {
            JsonNode root = json.readTree(body);
            JsonNode data = root.path("data");
            JsonNode verdict = data.path("verdict");
            String risk = verdict.path("risk_level").asText("");
            String scanId = data.path("scan_id").asText("");
            int tier = data.path("tier_executed").asInt(0);
            JsonNode confidence = verdict.path("confidence");
            String summary = verdict.path("summary").asText("");
            if (!"success".equals(root.path("status").asText()) || !root.path("error").isNull()
                    && !root.path("error").isMissingNode()
                    || scanId.isBlank() || scanId.length() > 200 || (tier != 1 && tier != 2)
                    || !List.of("SAFE", "SUSPICIOUS", "DANGEROUS").contains(risk)
                    || !confidence.isNumber() || confidence.asDouble() < 0 || confidence.asDouble() > 1
                    || summary.isBlank()) return Result.failure("AI_INVALID_RESPONSE");
            var guidance = new StringBuilder();
            for (JsonNode item : data.path("actionable_recommendations")) {
                if (!item.isTextual()) return Result.failure("AI_INVALID_RESPONSE");
                if (!guidance.isEmpty()) guidance.append('\n');
                guidance.append(item.asText());
            }
            if (guidance.isEmpty()) guidance.append("Xác minh qua kênh chính thức trước khi chuyển tiền hoặc cung cấp thông tin cá nhân.");
            return new Result(switch (risk) {
                case "SAFE" -> "LOW_RISK";
                case "DANGEROUS" -> "SCAM_RISK";
                default -> "UNKNOWN";
            }, tier == 1 ? "VISOBERT" : "LLM", confidence.decimalValue(), summary,
                    guidance.toString(), "SUSPICIOUS".equals(risk) ? "AI_UNCERTAIN" : null, scanId);
        } catch (Exception ex) {
            return Result.failure("AI_INVALID_RESPONSE");
        }
    }
}
