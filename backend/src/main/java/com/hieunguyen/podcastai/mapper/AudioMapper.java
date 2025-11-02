package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.request.AudioRequest;
import com.hieunguyen.podcastai.dto.response.AudioFileDto;
import com.hieunguyen.podcastai.dto.response.UserDto;
import com.hieunguyen.podcastai.entity.AudioFile;
import com.hieunguyen.podcastai.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AudioMapper {

    AudioFile toEntity(AudioRequest request);

    AudioFileDto toDto(AudioFile audioFile);

    List<AudioFileDto> toDtoList(List<AudioFile> audioFiles);

    void updateEntity(AudioRequest request, @MappingTarget AudioFile audioFile);

    @Named("mapUser")
    default UserDto mapUser(User user) {
        if (user == null) {
            return null;
        }
        return UserDto.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .avatarUrl(user.getAvatarUrl())
            .role(user.getRole())
            .status(user.getStatus())
            .emailVerified(user.getEmailVerified())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
    
    /**
     * Map TtsConfig entity to TtsConfigDto (simplified)
     */
    @Named("mapTtsConfig")
    default com.hieunguyen.podcastai.dto.response.TtsConfigDto mapTtsConfig(com.hieunguyen.podcastai.entity.TtsConfig ttsConfig) {
        if (ttsConfig == null) {
            return null;
        }
        return com.hieunguyen.podcastai.dto.response.TtsConfigDto.builder()
            .id(ttsConfig.getId())
            .name(ttsConfig.getName())
            .description(ttsConfig.getDescription())
            .languageCode(ttsConfig.getLanguageCode())
            .voiceName(ttsConfig.getVoiceName())
            .speakingRate(ttsConfig.getSpeakingRate())
            .pitch(ttsConfig.getPitch())
            .volumeGainDb(ttsConfig.getVolumeGainDb())
            .audioEncoding(ttsConfig.getAudioEncoding())
            .sampleRateHertz(ttsConfig.getSampleRateHertz())
            .createdAt(ttsConfig.getCreatedAt() != null ? ttsConfig.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant() : null)
            .updatedAt(ttsConfig.getUpdatedAt() != null ? ttsConfig.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant() : null)
            .userId(ttsConfig.getUser() != null ? ttsConfig.getUser().getId() : null)
            .build();
    }
}
