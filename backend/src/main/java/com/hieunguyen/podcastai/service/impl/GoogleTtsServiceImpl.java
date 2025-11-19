package com.hieunguyen.podcastai.service.impl;

import com.google.api.gax.longrunning.OperationFuture;
import com.google.cloud.texttospeech.v1.AudioConfig;
import com.google.cloud.texttospeech.v1.ListVoicesRequest;
import com.google.cloud.texttospeech.v1.ListVoicesResponse;
import com.google.cloud.texttospeech.v1.SynthesisInput;
import com.google.cloud.texttospeech.v1.SynthesizeLongAudioMetadata;
import com.google.cloud.texttospeech.v1.SynthesizeLongAudioRequest;
import com.google.cloud.texttospeech.v1.SynthesizeLongAudioResponse;
import com.google.cloud.texttospeech.v1.TextToSpeechClient;
import com.google.cloud.texttospeech.v1.TextToSpeechLongAudioSynthesizeClient;
import com.google.cloud.texttospeech.v1.Voice;
import com.google.cloud.texttospeech.v1.VoiceSelectionParams;
import com.google.longrunning.Operation;
import com.google.protobuf.Timestamp;
import com.hieunguyen.podcastai.dto.request.LongAudioSynthesisRequest;
import com.hieunguyen.podcastai.dto.request.VoiceSettingsRequest;
import com.hieunguyen.podcastai.dto.response.LongAudioSynthesisResponse;
import com.hieunguyen.podcastai.service.GoogleTtsService;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;


@Service
@Slf4j
@RequiredArgsConstructor
public class GoogleTtsServiceImpl implements GoogleTtsService {

    private final TextToSpeechClient textToSpeechClient;
    private final TextToSpeechLongAudioSynthesizeClient longAudioSynthesizeClient;

    @Value("${google.cloud.tts.project-id:}")
    private String projectId;

    @Value("${google.cloud.tts.long-audio.gcs-bucket-name:}")
    private String defaultGcsBucketName;

    @Value("${google.cloud.tts.long-audio.location:global}")
    private String location;

    @Value("${google.cloud.tts.long-audio.operation-timeout-seconds:300}")
    private int operationTimeoutSeconds;

    @Override
    public List<Voice> getAvailableVoices(String languageCode) {
        log.info("Getting available voices for language: {}", languageCode);
        
        try {
            ListVoicesRequest request = ListVoicesRequest.newBuilder()
                    .setLanguageCode(languageCode)
                    .build();

            ListVoicesResponse response = textToSpeechClient.listVoices(request);
            
            log.info("Found {} voices for language: {}", response.getVoicesCount(), languageCode);
            return response.getVoicesList();

        } catch (Exception e) {
            log.error("Failed to get available voices for language {}: {}", languageCode, e.getMessage(), e);
            throw new RuntimeException("Failed to get available voices", e);
        }
    }

    @Override
    public boolean validateVoiceSettings(VoiceSettingsRequest voiceSettings) {
        log.debug("Validating voice settings");
        
        try {
            List<Voice> voices = getAvailableVoices(voiceSettings.getLanguageCode());
            boolean voiceExists = voices.stream()
                    .anyMatch(voice -> voice.getName().equals(voiceSettings.getVoiceName()));
            
            if (!voiceExists) {
                log.warn("Voice {} not found for language {}", 
                        voiceSettings.getVoiceName(), voiceSettings.getLanguageCode());
                return false;
            }

            log.debug("Voice settings validation successful");
            return true;

        } catch (Exception e) {
            log.error("Failed to validate voice settings: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public LongAudioSynthesisResponse synthesizeLongAudio(LongAudioSynthesisRequest request) {
        log.info("Starting long audio synthesis: {} characters", request.getText().length());
        
        try {
            SynthesisInput input;
            String text = request.getText();
            if (text != null && text.trim().startsWith("<speak>")) {
                // SSML input
                input = SynthesisInput.newBuilder()
                        .setSsml(text)
                        .build();
                log.debug("Using SSML input for long audio synthesis");
            } else {
                // Plain text input
                input = SynthesisInput.newBuilder()
                        .setText(text)
                        .build();
                log.debug("Using plain text input for long audio synthesis");
            }

            VoiceSelectionParams voice = VoiceSelectionParams.newBuilder()
                    .setLanguageCode(request.getVoiceSettings().getLanguageCode())
                    .setName(request.getVoiceSettings().getVoiceName())
                    .build();

            // Long form audio synthesis only supports LINEAR16 (WAV) format
            AudioConfig audioConfig = AudioConfig.newBuilder()
                    .setAudioEncoding(com.google.cloud.texttospeech.v1.AudioEncoding.LINEAR16)
                    .setSpeakingRate(request.getVoiceSettings().getSpeakingRate())
                    .setPitch(request.getVoiceSettings().getPitch())
                    .setVolumeGainDb(request.getVoiceSettings().getVolumeGain())
                    .setSampleRateHertz(request.getVoiceSettings().getSampleRateHertz().getHertz())
                    .build();

            String fileName = request.getOutputFileName();
            
            String outputGcsUri = String.format("gs://%s/%s", defaultGcsBucketName, fileName);
            log.info("Output GCS URI: {}", outputGcsUri);

            // Build parent path
            String parent = String.format("projects/%s/locations/%s", projectId, location);

            // Build long audio synthesis request
            SynthesizeLongAudioRequest synthesisRequest = SynthesizeLongAudioRequest.newBuilder()
                    .setParent(parent)
                    .setInput(input)
                    .setAudioConfig(audioConfig)
                    .setVoice(voice)
                    .setOutputGcsUri(outputGcsUri)
                    .build();

            // Start the long-running operation
            OperationFuture<SynthesizeLongAudioResponse, SynthesizeLongAudioMetadata> operationFuture =
                    longAudioSynthesizeClient.synthesizeLongAudioAsync(synthesisRequest);
            
            // Get operation name from the initial snapshot
            String operationName = operationFuture.getInitialFuture().get().getName();
            
            log.info("Long audio synthesis operation started: {}", operationName);

            // Get the full operation to extract metadata
            Operation operation = longAudioSynthesizeClient.getOperationsClient().getOperation(operationName);

            // Extract metadata if available
            SynthesizeLongAudioMetadata metadata = null;
            if (operation.getMetadata().is(SynthesizeLongAudioMetadata.class)) {
                try {
                    metadata = operation.getMetadata().unpack(SynthesizeLongAudioMetadata.class);
                } catch (Exception e) {
                    log.warn("Could not unpack metadata: {}", e.getMessage());
                }
            }

            // Build response
            LongAudioSynthesisResponse.LongAudioSynthesisResponseBuilder responseBuilder = LongAudioSynthesisResponse.builder()
                    .operationName(operationName)
                    .outputGcsUri(outputGcsUri)
                    .done(operation.getDone())
                    .startedAt(LocalDateTime.now());

            if (metadata != null) {
                responseBuilder.progressPercentage(metadata.getProgressPercentage());
                if (metadata.hasStartTime()) {
                    responseBuilder.startedAt(convertTimestamp(metadata.getStartTime()));
                }
            }
            
            responseBuilder.lastUpdateTime(LocalDateTime.now());

            if (operation.getDone() && operation.hasError()) {
                responseBuilder.errorMessage(operation.getError().getMessage());
                log.error("Long audio synthesis operation failed: {}", operation.getError().getMessage());
            }

            return responseBuilder.build();

        } catch (Exception e) {
            log.error("Failed to start long audio synthesis: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to start long audio synthesis", e);
        }
    }

    @Override
    public LongAudioSynthesisResponse checkLongAudioOperationStatus(String operationName) {
        log.info("Checking long audio synthesis operation status: {}", operationName);
        
        try {
            // Get the operation
            Operation operation = longAudioSynthesizeClient.getOperationsClient().getOperation(operationName);
            
            log.info("Operation status - Done: {}, Name: {}", operation.getDone(), operation.getName());

            // Extract metadata
            SynthesizeLongAudioMetadata metadata = null;
            if (operation.getMetadata().is(SynthesizeLongAudioMetadata.class)) {
                try {
                    metadata = operation.getMetadata().unpack(SynthesizeLongAudioMetadata.class);
                } catch (Exception e) {
                    log.warn("Could not unpack metadata: {}", e.getMessage());
                }
            }

            // Build response
            LongAudioSynthesisResponse.LongAudioSynthesisResponseBuilder responseBuilder = LongAudioSynthesisResponse.builder()
                    .operationName(operationName)
                    .done(operation.getDone());

            if (metadata != null) {
                responseBuilder.progressPercentage(metadata.getProgressPercentage());
                if (metadata.hasStartTime()) {
                    responseBuilder.startedAt(convertTimestamp(metadata.getStartTime()));
                }
            }
            
            // Set last update time to current time since the deprecated method is no longer available
            responseBuilder.lastUpdateTime(LocalDateTime.now());

            if (operation.getDone() && operation.hasError()) {
                responseBuilder.errorMessage(operation.getError().getMessage());
                log.error("Long audio synthesis operation failed: {}", operation.getError().getMessage());
            } else if (operation.getDone()) {
                log.info("Long audio synthesis operation completed successfully");
            }

            return responseBuilder.build();

        } catch (Exception e) {
            log.error("Failed to check long audio synthesis operation status: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to check operation status", e);
        }
    }


    private LocalDateTime convertTimestamp(Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        }
        Instant instant = Instant.ofEpochSecond(timestamp.getSeconds(), timestamp.getNanos());
        return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }

    @PreDestroy
    public void close() {
        longAudioSynthesizeClient.close();
    }
}
