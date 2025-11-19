package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.TtsConfigRequest;
import com.hieunguyen.podcastai.dto.request.TtsConfigUpdateRequest;
import com.hieunguyen.podcastai.dto.response.TtsConfigDto;


public interface TtsConfigService {

    TtsConfigDto createTtsConfig(TtsConfigRequest request);
    TtsConfigDto getTtsConfigByUser();
    TtsConfigDto updateTtsConfig(Long id, TtsConfigUpdateRequest request);
    void deleteTtsConfig(Long id);
}
   
