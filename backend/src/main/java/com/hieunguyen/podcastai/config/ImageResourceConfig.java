package com.hieunguyen.podcastai.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ImageResourceConfig implements WebMvcConfigurer {

    @Value("${app.image.storage.path:./uploads/images}")
    private String imageStoragePath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve images from storage directory
        registry.addResourceHandler("/api/v1/images/**")
                .addResourceLocations("file:" + imageStoragePath + "/");
    }
}

