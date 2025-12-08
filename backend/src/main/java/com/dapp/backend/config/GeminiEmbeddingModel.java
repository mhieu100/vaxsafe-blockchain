package com.dapp.backend.config;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Primary
public class GeminiEmbeddingModel implements EmbeddingModel {

    private final RestClient restClient;
    private final String apiKey;
    private final String baseUrl;
    private final String model;

    public GeminiEmbeddingModel(
            @Value("${spring.ai.openai.api-key}") String apiKey,
            @Value("${spring.ai.openai.base-url}") String baseUrl,
            @Value("${spring.ai.openai.embedding.options.model}") String model) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.model = model;
        this.restClient = RestClient.builder().build();
    }

    @Override
    public EmbeddingResponse call(EmbeddingRequest request) {

        Map<String, Object> body = Map.of(
                "input", request.getInstructions(),
                "model", model);


        Map response = restClient.post()
                .uri(baseUrl + "/embeddings")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(Map.class);

        if (response == null || !response.containsKey("data")) {
            throw new RuntimeException("Invalid response from Gemini API: " + response);
        }


        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
        List<Embedding> embeddings = data.stream()
                .map(item -> {
                    List<Double> vector = (List<Double>) item.get("embedding");
                    Integer index = (Integer) item.get("index");
                    return new Embedding(vector, index);
                })
                .collect(Collectors.toList());


        return new EmbeddingResponse(embeddings, new EmbeddingResponseMetadata());
    }

    @Override
    public List<Double> embed(String text) {
        EmbeddingRequest request = new EmbeddingRequest(List.of(text),
                org.springframework.ai.embedding.EmbeddingOptions.EMPTY);
        EmbeddingResponse response = this.call(request);
        if (response.getResults().isEmpty()) {
            return List.of();
        }
        return response.getResults().get(0).getOutput();
    }

    @Override
    public List<Double> embed(Document document) {
        return this.embed(document.getContent());
    }
}
