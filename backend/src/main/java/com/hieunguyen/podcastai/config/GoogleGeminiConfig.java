package com.hieunguyen.podcastai.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class GoogleGeminiConfig {

    @Value("${spring.ai.google.genai.project-id}")
    private String projectId;

    @Value("${spring.ai.google.genai.location:us-central1}")
    private String location;

    @Value("${spring.ai.google.genai.chat.options.model:gemini-pro}")
    private String model;

    @Value("${spring.ai.google.genai.chat.options.temperature:0.7}")
    private Double temperature;

    @PostConstruct
    public void init() {
        log.info("========== SETTING UP GEMINI CONFIG ==========");
        log.info("Project ID: {}", projectId);
        log.info("Location: {}", location);
        log.info("Model: {}", model);
        log.info("Temperature: {}", temperature);
        log.info("Note: Spring AI autoconfiguration will create ChatModel");
        log.info("      using GOOGLE_APPLICATION_CREDENTIALS from GoogleCloudTtsConfig");
        log.info("==========================================");
    }

    @Bean
    public ChatClient chatClient(ChatModel chatModel) {
        log.info("Creating ChatClient from auto-configured ChatModel...");
        log.info("ChatModel type: {}", chatModel.getClass().getName());
        return ChatClient.builder(chatModel).build();
    }
}