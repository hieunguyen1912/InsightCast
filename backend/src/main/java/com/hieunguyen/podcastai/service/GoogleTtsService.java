package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.LongAudioSynthesisRequest;
import com.hieunguyen.podcastai.dto.request.VoiceSettingsRequest;
import com.hieunguyen.podcastai.dto.response.LongAudioSynthesisResponse;

public interface GoogleTtsService {

    java.util.List<com.google.cloud.texttospeech.v1.Voice> getAvailableVoices(String languageCode);

    boolean validateVoiceSettings(VoiceSettingsRequest voiceSettings);

    LongAudioSynthesisResponse synthesizeLongAudio(LongAudioSynthesisRequest request);

    LongAudioSynthesisResponse checkLongAudioOperationStatus(String operationName);
}
