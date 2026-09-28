package com.stockpulse.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class LLMGateway {

    private static final Logger log = LoggerFactory.getLogger(LLMGateway.class);

    @Value("${llm.provider:litellm}")
    private String provider;

    @Value("${llm.base-url:https://litellm-qc.zycus.net/v1/chat/completions}")
    private String baseUrl;

    @Value("${llm.api-key:sk-SfyNGxhcv7RnQKbZFWX2LQ}")
    private String apiKey;

    @Value("${llm.model:qwen-cursor}")
    private String model;

    @Value("${llm.product:PC1}")
    private String product;

    @Value("${llm.cookie:6bf6da0e46dc446bd58693d49c303e18=f3f865650f0f8f3b30731936b2eb5857}")
    private String cookie;

    @Value("${llm.timeout-seconds:25}")
    private int timeoutSeconds;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String callLLM(String prompt) {
        log.info("Sending LLM request to provider [{}] at [{}], model [{}]", provider, baseUrl, model);

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(10));
        requestFactory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));

        RestClient restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", List.of(
                Map.of(
                        "role", "system",
                        "content", "You are StockPulse AI, an expert commerce advisor for dynamic pricing and inventory replenishment. Return ONLY valid raw JSON matching the requested schema without markdown code blocks, backticks, or preamble."
                ),
                Map.of(
                        "role", "user",
                        "content", prompt
                )
        ));

        try {
            var requestSpec = restClient.post()
                    .uri(baseUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .body(requestBody);

            if (product != null && !product.isBlank()) {
                requestSpec.header("product", product);
            }
            if (cookie != null && !cookie.isBlank()) {
                requestSpec.header(HttpHeaders.COOKIE, cookie);
            }

            String responseBody = requestSpec.retrieve().body(String.class);
            log.debug("LLM raw response: {}", responseBody);

            if (responseBody == null || responseBody.isBlank()) {
                throw new IllegalStateException("Empty response from LLM gateway");
            }

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                JsonNode message = choices.get(0).path("message");
                String content = message.path("content").asText();
                return cleanRawJson(content);
            }

            // In case response is direct content
            return cleanRawJson(responseBody);
        } catch (Exception e) {
            log.error("LLM Gateway call failed: {}", e.getMessage(), e);
            throw new RuntimeException("LLM Gateway error: " + e.getMessage(), e);
        }
    }

    /**
     * Strips Markdown code blocks like ```json ... ``` if returned by the LLM
     */
    private String cleanRawJson(String raw) {
        if (raw == null) return "{}";
        String trimmed = raw.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }
}
