package com.hieunguyen.podcastai.config;

import java.util.List;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("User API")
                .version("1.0.0")
                .description("API for PodcastAI")
                .license(new License().name("API License").url("https://hieunguyen.com")))
                .servers(List.of(new Server().url("http://localhost:8081").description("Local Server")))
                .components(
                    new Components()
                    .addSecuritySchemes(
                        "bearerAuth", 
                        new SecurityScheme().type(SecurityScheme.Type.HTTP)
                    .scheme("bearer").bearerFormat("JWT")))
                .security(List.of(new SecurityRequirement().addList("bearerAuth")));
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
            .group("api-service")
            .packagesToScan("com.hieunguyen.podcastai.controller")
            .build();
    }
}
