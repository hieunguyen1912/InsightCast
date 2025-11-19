package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.TtsConfigRequest;
import com.hieunguyen.podcastai.dto.request.TtsConfigUpdateRequest;
import com.hieunguyen.podcastai.dto.response.TtsConfigDto;
import com.hieunguyen.podcastai.entity.TtsConfig;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.mapper.TtsConfigMapper;
import com.hieunguyen.podcastai.repository.TtsConfigRepository;
import com.hieunguyen.podcastai.service.TtsConfigService;
import com.hieunguyen.podcastai.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class TtsConfigServiceImpl implements TtsConfigService {

    private final TtsConfigRepository ttsConfigRepository;
    private final TtsConfigMapper ttsConfigMapper;
    private final SecurityUtils securityUtils;

    @Override
    public TtsConfigDto createTtsConfig(TtsConfigRequest request) {
        log.info("Creating TTS configuration with name: {}", request.getName());
        
        User currentUser = securityUtils.getCurrentUser();
        
        // Check if name already exists for the user
        if (ttsConfigRepository.existsByUserAndName(currentUser, request.getName())) {
            throw new AppException(ErrorCode.TTS_CONFIG_NAME_EXISTS);
        }
        
        
        TtsConfig ttsConfig = ttsConfigMapper.toEntity(request);
        ttsConfig.setUser(currentUser);
        ttsConfig.setAudioEncoding("LINEAR16");

        currentUser.setDefaultTtsConfig(ttsConfig);
        
        TtsConfig savedTtsConfig = ttsConfigRepository.save(ttsConfig);
        log.info("Successfully created TTS configuration with ID: {}", savedTtsConfig.getId());
        
        return ttsConfigMapper.toDto(savedTtsConfig);
    }


    @Override
    @Transactional(readOnly = true)
    public TtsConfigDto getTtsConfigByUser() {

        User currentUser = securityUtils.getCurrentUser();
        TtsConfig ttsConfig = ttsConfigRepository.findByUser(currentUser)
                .orElseThrow(() -> new AppException(ErrorCode.TTS_CONFIG_NOT_FOUND));
        
        return ttsConfigMapper.toDto(ttsConfig);
    }


    @Override
    public TtsConfigDto updateTtsConfig(Long id, TtsConfigUpdateRequest request) {
        log.info("Updating TTS configuration with ID: {}", id);
        
        User currentUser = securityUtils.getCurrentUser();
        TtsConfig ttsConfig = ttsConfigRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TTS_CONFIG_NOT_FOUND));
        
        // Check if the TTS config belongs to the current user
        if (!ttsConfig.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.TTS_CONFIG_ACCESS_DENIED);
        }
        
        // Check if new name already exists (if name is being updated)
        if (request.getName() != null && !request.getName().equals(ttsConfig.getName())) {
            if (ttsConfigRepository.existsByUserAndName(currentUser, request.getName())) {
                throw new AppException(ErrorCode.TTS_CONFIG_NAME_EXISTS);
            }
        }
     
        ttsConfigMapper.updateEntity(request, ttsConfig);
        TtsConfig updatedTtsConfig = ttsConfigRepository.save(ttsConfig);
        
        log.info("Successfully updated TTS configuration with ID: {}", updatedTtsConfig.getId());
        return ttsConfigMapper.toDto(updatedTtsConfig);
    }

    @Override
    public void deleteTtsConfig(Long id) {
        log.info("Deleting TTS configuration with ID: {}", id);
        
        User currentUser = securityUtils.getCurrentUser();
        TtsConfig ttsConfig = ttsConfigRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TTS_CONFIG_NOT_FOUND));
        
        // Check if the TTS config belongs to the current user
        if (!ttsConfig.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.TTS_CONFIG_ACCESS_DENIED);
        }
        
        ttsConfigRepository.delete(ttsConfig);
        
        log.info("Successfully deleted TTS configuration with ID: {}", id);
    }

  
}
