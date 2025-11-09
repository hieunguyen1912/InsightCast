package com.hieunguyen.podcastai.config;

import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.cloud.texttospeech.v1.TextToSpeechClient;
import com.google.cloud.texttospeech.v1.TextToSpeechSettings;
import com.google.cloud.texttospeech.v1.TextToSpeechLongAudioSynthesizeClient;
import com.google.cloud.texttospeech.v1.TextToSpeechLongAudioSynthesizeSettings;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@Slf4j
public class GoogleCloudTtsConfig {

    @Value("${google.cloud.tts.project-id:}")
    private String projectId;

    @Value("${google.cloud.tts.credentials.path:}")
    private String credentialsPath;

    @Value("${google.cloud.tts.long-audio.gcs-bucket-name:}")
    private String gcsBucketName;

    @Value("${google.cloud.tts.long-audio.location:global}")
    private String location;

    @Value("${google.cloud.tts.long-audio.operation-timeout-seconds:300}")
    private int operationTimeoutSeconds;

    @PostConstruct
    public void init() throws Exception {
        log.info("========== SETTING UP CREDENTIALS ==========");

        // 1. Clear environment trước
        clearEnvironment("GOOGLE_APPLICATION_CREDENTIALS");

        // 2. Verify file exists
        Path credPath = Paths.get(credentialsPath);
        log.info("Credentials file: {}", credPath.toAbsolutePath());
        log.info("File exists: {}", Files.exists(credPath));

        if (!Files.exists(credPath)) {
            throw new FileNotFoundException("Credentials file not found: " + credPath.toAbsolutePath());
        }

        // 3. Set system property
        String absolutePath = credPath.toAbsolutePath().toString();
        System.setProperty("GOOGLE_APPLICATION_CREDENTIALS", absolutePath);
        log.info("✓ System property set to: {}", absolutePath);
        log.info("✓ Verified: {}", System.getProperty("GOOGLE_APPLICATION_CREDENTIALS"));

        log.info("==========================================");
    }

    private void clearEnvironment(String key) {
        try {
            Class<?> cl = Class.forName("java.lang.ProcessEnvironment");
            java.lang.reflect.Field f = cl.getDeclaredField("theEnvironment");
            f.setAccessible(true);
            Object obj = f.get(null);

            @SuppressWarnings("unchecked")
            java.util.Map<String, String> map = (java.util.Map<String, String>) obj;
            map.remove(key);
            log.info("Cleared environment variable: {}", key);
        } catch (Exception e) {
            log.warn("Could not clear environment: {}", e.getMessage());
        }
    }

    @Bean
    public TextToSpeechClient textToSpeechClient() throws Exception {
        log.info("Creating TextToSpeechClient...");
        log.info("Current GOOGLE_APPLICATION_CREDENTIALS: {}", System.getProperty("GOOGLE_APPLICATION_CREDENTIALS"));

        try {
            GoogleCredentials credentials = GoogleCredentials.fromStream(
                    new FileInputStream(credentialsPath)
            );

            TextToSpeechSettings settings = TextToSpeechSettings.newBuilder()
                    .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                    .build();

            TextToSpeechClient client = TextToSpeechClient.create(settings);
            log.info("✓ TextToSpeechClient created successfully");
            return client;

        } catch (Exception e) {
            log.error("✗ Failed to create client: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Bean
    public TextToSpeechLongAudioSynthesizeClient textToSpeechLongAudioSynthesizeClient() throws Exception {
        log.info("Creating TextToSpeechLongAudioSynthesizeClient...");
        log.info("Current GOOGLE_APPLICATION_CREDENTIALS: {}", System.getProperty("GOOGLE_APPLICATION_CREDENTIALS"));

        try {
            GoogleCredentials credentials = GoogleCredentials.fromStream(
                    new FileInputStream(credentialsPath)
            );

            TextToSpeechLongAudioSynthesizeSettings settings = TextToSpeechLongAudioSynthesizeSettings.newBuilder()
                    .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                    .build();

            TextToSpeechLongAudioSynthesizeClient client = TextToSpeechLongAudioSynthesizeClient.create(settings);
            log.info("✓ TextToSpeechLongAudioSynthesizeClient created successfully");
            return client;

        } catch (Exception e) {
            log.error("✗ Failed to create long audio client: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Bean
    public Storage storage() throws Exception {
        log.info("Creating Google Cloud Storage client...");
        
        try {
            GoogleCredentials credentials = GoogleCredentials.fromStream(
                    new FileInputStream(credentialsPath)
            );

            Storage storage = StorageOptions.newBuilder()
                    .setCredentials(credentials)
                    .setProjectId(projectId)
                    .build()
                    .getService();
            
            log.info("✓ Google Cloud Storage client created successfully");
            return storage;

        } catch (Exception e) {
            log.error("✗ Failed to create Storage client: {}", e.getMessage(), e);
            throw e;
        }
    }
}