package com.hieunguyen.podcastai.controller;

import com.google.cloud.texttospeech.v1.Voice;
import com.hieunguyen.podcastai.dto.request.GoogleTtsRequest;
import com.hieunguyen.podcastai.dto.request.LongAudioSynthesisRequest;
import com.hieunguyen.podcastai.dto.request.VoiceSettingsRequest;
import com.hieunguyen.podcastai.dto.response.GoogleTtsResponse;
import com.hieunguyen.podcastai.dto.response.LongAudioSynthesisResponse;
import com.hieunguyen.podcastai.enums.AudioEncoding;
import com.hieunguyen.podcastai.enums.SampleRate;
import com.hieunguyen.podcastai.service.GoogleTtsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Google Cloud Text-to-Speech operations
 */
@RestController
@RequestMapping("/api/v1/tts")
@Slf4j
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class GoogleTtsController {

    private final GoogleTtsService googleTtsService;

    
    @PostMapping("/synthesize")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<byte[]> synthesizeText(@Valid @RequestBody GoogleTtsRequest request) {
        log.info("Received TTS synthesis request for {} characters", request.getText().length());
        
        try {
            byte[] response = googleTtsService.synthesizeAudioBytes(request);
            
            // Determine the correct content type and file extension based on audio encoding
            AudioEncoding encoding = request.getVoiceSettings().getAudioEncoding();
            String contentType = encoding.getMimeType();
            String fileExtension = encoding.getFileExtension();
            
            log.info("Successfully processed TTS synthesis request, returning {} audio", contentType);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"audio." + fileExtension + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .body(response);
            
        } catch (Exception e) {
            log.error("Failed to synthesize text: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    
    @PostMapping("/synthesize-with-settings")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<GoogleTtsResponse> synthesizeWithSettings(
            @RequestParam String text,
            @Valid @RequestBody VoiceSettingsRequest voiceSettings) {
        
        log.info("Received TTS synthesis request with custom settings for {} characters", text.length());
        
        try {
            GoogleTtsResponse response = googleTtsService.synthesizeTextWithSettings(text, voiceSettings);
            log.info("Successfully processed TTS synthesis request with custom settings");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to synthesize text with custom settings: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Gets available voices for a language
     * 
     * @param languageCode the language code
     * @return list of available voices
     */
    @GetMapping("/voices")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Voice>> getAvailableVoices(@RequestParam String languageCode) {
        log.info("Getting available voices for language: {}", languageCode);
        
        try {
            List<Voice> voices = googleTtsService.getAvailableVoices(languageCode);
            log.info("Found {} voices for language: {}", voices.size(), languageCode);
            return ResponseEntity.ok(voices);
            
        } catch (Exception e) {
            log.error("Failed to get available voices for language {}: {}", languageCode, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Validates voice settings
     * 
     * @param voiceSettings the voice settings to validate
     * @return validation result
     */
    @PostMapping("/validate-voice-settings")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Boolean> validateVoiceSettings(@Valid @RequestBody VoiceSettingsRequest voiceSettings) {
        log.info("Validating voice settings for language: {} and voice: {}", 
                voiceSettings.getLanguageCode(), voiceSettings.getVoiceName());
        
        try {
            boolean isValid = googleTtsService.validateVoiceSettings(voiceSettings);
            log.info("Voice settings validation result: {}", isValid);
            return ResponseEntity.ok(isValid);
            
        } catch (Exception e) {
            log.error("Failed to validate voice settings: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/speak")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<byte[]> speakText(
            @RequestParam String text,
            @RequestParam(defaultValue = "vi-VN") String languageCode,
            @RequestParam(defaultValue = "vi-VN-Standard-A") String voiceName) {
        
        log.info("Received simple TTS request for text: {} ({} chars)", text.substring(0, Math.min(50, text.length())), text.length());
        
        try {
            // Create a simple request with default voice settings
            GoogleTtsRequest request = GoogleTtsRequest.builder()
                    .text(text)
                    .voiceSettings(VoiceSettingsRequest.builder()
                            .languageCode(languageCode)
                            .voiceName(voiceName)
                            .speakingRate(1.0)  // Default speaking rate
                            .pitch(0.0)         // Default pitch
                            .volumeGain(0.0)     // Default volume gain
                            .audioEncoding(AudioEncoding.MP3)  // Default audio encoding
                            .sampleRateHertz(SampleRate.DEFAULT)  // Default sample rate
                            .build())
                    .build();
            
            byte[] response = googleTtsService.synthesizeAudioBytes(request);
            
            log.info("Successfully generated audio for simple TTS request");
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("audio/mpeg"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"speech.mp3\"")
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .body(response);
            
        } catch (Exception e) {
            log.error("Failed to synthesize simple text: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Health check endpoint for TTS service
     * 
     * @return service status
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        log.debug("TTS service health check requested");
        return ResponseEntity.ok("Google Cloud TTS service is running");
    }

    /**
     * Get available audio encodings for dropdown
     * 
     * @return list of audio encoding options
     */
    @GetMapping("/audio-encodings")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<AudioEncodingOption>> getAudioEncodings() {
        log.debug("Getting available audio encodings");
        List<AudioEncodingOption> encodings = java.util.Arrays.stream(AudioEncoding.values())
                .map(encoding -> new AudioEncodingOption(encoding.name(), encoding.getValue(), encoding.getMimeType(), encoding.getFileExtension()))
                .toList();
        return ResponseEntity.ok(encodings);
    }

    /**
     * Get available sample rates for dropdown
     * 
     * @return list of sample rate options
     */
    @GetMapping("/sample-rates")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<SampleRateOption>> getSampleRates() {
        log.debug("Getting available sample rates");
        List<SampleRateOption> rates = java.util.Arrays.stream(SampleRate.values())
                .map(rate -> new SampleRateOption(rate.name(), rate.getHertz()))
                .toList();
        return ResponseEntity.ok(rates);
    }

    /**
     * Get available language codes for dropdown
     * 
     * @return list of language code options
     */
    @GetMapping("/language-codes")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<LanguageCodeOption>> getLanguageCodes() {
        log.debug("Getting available language codes");
        List<LanguageCodeOption> languages = java.util.Arrays.stream(com.hieunguyen.podcastai.enums.LanguageCode.values())
                .map(lang -> new LanguageCodeOption(lang.getCode(), lang.getDisplayName()))
                .toList();
        return ResponseEntity.ok(languages);
    }

    /**
     * Synthesize long-form audio using Google Cloud TTS Long Audio Synthesis API
     * Supports up to 1MB of input text and outputs to Google Cloud Storage
     * 
     * @param request Long audio synthesis request
     * @return Response containing operation name and GCS URI
     */
    @PostMapping("/synthesize-long-audio")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<LongAudioSynthesisResponse> synthesizeLongAudio(
            @Valid @RequestBody LongAudioSynthesisRequest request) {
        log.info("Received long audio synthesis request for {} characters", request.getText().length());
        
        try {
            LongAudioSynthesisResponse response = googleTtsService.synthesizeLongAudio(request);
            log.info("Long audio synthesis operation started: {}", response.getOperationName());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to start long audio synthesis: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Check the status of a long-running audio synthesis operation
     * 
     * @param operationName The operation name returned from synthesizeLongAudio
     * @return Updated response with current status
     */
    @GetMapping("/long-audio-status/{operationName}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<LongAudioSynthesisResponse> checkLongAudioStatus(
            @PathVariable String operationName) {
        log.info("Checking long audio synthesis operation status: {}", operationName);
        
        try {
            LongAudioSynthesisResponse response = googleTtsService.checkLongAudioOperationStatus(operationName);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to check long audio synthesis operation status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Inner classes for response DTOs
    public record AudioEncodingOption(String name, String value, String mimeType, String fileExtension) {}
    public record SampleRateOption(String name, Integer hertz) {}
    public record LanguageCodeOption(String code, String displayName) {}
}
