package com.be.scamshield.external;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class ScamCheckAiClientTest {
    private final ObjectMapper json = new ObjectMapper();

    private String response(String risk, int tier) {
        return """
                {"status":"success","error":null,"data":{"scan_id":"SC-123","tier_executed":%d,
                "verdict":{"risk_level":"%s","confidence":0.996,"summary":"Model result"},
                "actionable_recommendations":["Verify first","Do not send OTP"]}}
                """.formatted(tier, risk);
    }

    @Test
    void mapsBothTiersAndRejectsInvalidVerdicts() {
        var client = new ScamCheckAiClient(json, "http://localhost:8000", 1000, 1000, true);
        assertThat(client.parse(response("SAFE", 1)).verdict()).isEqualTo("LOW_RISK");
        assertThat(client.parse(response("DANGEROUS", 1)).stage()).isEqualTo("VISOBERT");
        assertThat(client.parse(response("DANGEROUS", 2)).verdict()).isEqualTo("SCAM_RISK");
        assertThat(client.parse(response("SUSPICIOUS", 2)).unknownReason()).isEqualTo("AI_UNCERTAIN");
        assertThat(client.parse(response("SAFE", 0)).unknownReason()).isEqualTo("AI_INVALID_RESPONSE");
        assertThat(client.parse(response("SAFE", 1).replace("0.996", "1.5")).verdict()).isEqualTo("UNKNOWN");
        assertThat(client.parse("{}").unknownReason()).isEqualTo("AI_INVALID_RESPONSE");
    }

    @Test
    void postsMaskedContentWithMappedTypeAndHandlesHttpErrors() throws Exception {
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        var payload = new AtomicReference<String>();
        var upgrade = new AtomicReference<String>();
        var protocol = new AtomicReference<String>();
        server.createContext("/api/v1/scan", exchange -> {
            upgrade.set(exchange.getRequestHeaders().getFirst("Upgrade"));
            protocol.set(exchange.getProtocol());
            payload.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            byte[] bytes = response("DANGEROUS", 1).getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders("1".equals(exchange.getRequestHeaders().getFirst("X-Core-Check-Id")) ? 200 : 503, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        });
        server.start();
        try {
            var client = new ScamCheckAiClient(json, "http://127.0.0.1:" + server.getAddress().getPort(), 1000, 1000, true);
            var result = client.scan(1L, "MESSAGE", "Call [NUMBER]");
            assertThat(result.verdict()).isEqualTo("SCAM_RISK");
            assertThat(result.scanId()).isEqualTo("SC-123");
            assertThat(protocol.get()).isEqualTo("HTTP/1.1");
            assertThat(upgrade.get()).isNull();
            assertThat(json.readTree(payload.get()).path("check_type").asText()).isEqualTo("TEXT");
            assertThat(json.readTree(payload.get()).path("content").asText()).isEqualTo("Call [NUMBER]");
            assertThat(client.scan(2L, "DOMAIN", "example.test").unknownReason()).isEqualTo("AI_UNAVAILABLE");
        } finally {
            server.stop(0);
        }
    }
}
