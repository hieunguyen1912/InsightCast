package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.request.AudioRequest;
import com.hieunguyen.podcastai.dto.response.AudioFileDto;
import com.hieunguyen.podcastai.entity.AudioFile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AudioMapper {
    
    /**
     * Convert AudioRequest to AudioFile entity
     */
    @Mapping(target = "fileName", ignore = true)
    @Mapping(target = "filePath", ignore = true)
    @Mapping(target = "fileSizeBytes", ignore = true)
    @Mapping(target = "durationSeconds", ignore = true)
    @Mapping(target = "playCount", ignore = true)
    @Mapping(target = "downloadCount", ignore = true)
    @Mapping(target = "likeCount", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "ttsConfig", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "playlists", ignore = true)
    @Mapping(target = "favorites", ignore = true)
    @Mapping(target = "originalText", ignore = true)
    @Mapping(target = "sourceUrl", source = "newsArticleUrl")
    AudioFile toEntity(AudioRequest request);
    
    /**
     * Convert AudioFile entity to AudioFileDto
     */
    @Mapping(target = "downloadUrl", expression = "java(\"/api/v1/audio/\" + audioFile.getId() + \"/download\")")
    @Mapping(target = "streamUrl", expression = "java(\"/api/v1/audio/\" + audioFile.getId() + \"/stream\")")
    @Mapping(target = "user", source = "user", qualifiedByName = "mapUser")
    @Mapping(target = "ttsConfig", source = "ttsConfig", qualifiedByName = "mapTtsConfig")
    @Mapping(target = "category", source = "category", qualifiedByName = "mapCategory")
    @Mapping(target = "tags", source = "tags", qualifiedByName = "mapTags")
    AudioFileDto toDto(AudioFile audioFile);
    
    /**
     * Convert list of AudioFile entities to list of AudioFileDto
     */
    List<AudioFileDto> toDtoList(List<AudioFile> audioFiles);
    
    /**
     * Update AudioFile entity from AudioRequest
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fileName", ignore = true)
    @Mapping(target = "filePath", ignore = true)
    @Mapping(target = "fileSizeBytes", ignore = true)
    @Mapping(target = "durationSeconds", ignore = true)
    @Mapping(target = "playCount", ignore = true)
    @Mapping(target = "downloadCount", ignore = true)
    @Mapping(target = "likeCount", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "ttsConfig", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "playlists", ignore = true)
    @Mapping(target = "favorites", ignore = true)
    @Mapping(target = "originalText", ignore = true)
    @Mapping(target = "sourceUrl", source = "newsArticleUrl")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntity(AudioRequest request, @MappingTarget AudioFile audioFile);
    
    /**
     * Map User entity to UserDto (simplified)
     */
    @Named("mapUser")
    default com.hieunguyen.podcastai.dto.response.UserDto mapUser(com.hieunguyen.podcastai.entity.User user) {
        if (user == null) {
            return null;
        }
        return com.hieunguyen.podcastai.dto.response.UserDto.builder()
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
            .isDefault(ttsConfig.getIsDefault())
            .isActive(ttsConfig.getIsActive())
            .createdAt(ttsConfig.getCreatedAt() != null ? ttsConfig.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime() : null)
            .updatedAt(ttsConfig.getUpdatedAt() != null ? ttsConfig.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime() : null)
            .userId(ttsConfig.getUser() != null ? ttsConfig.getUser().getId() : null)
            .build();
    }
    
    /**
     * Map Category entity to CategoryDto (simplified)
     */
    @Named("mapCategory")
    default com.hieunguyen.podcastai.dto.response.CategoryDto mapCategory(com.hieunguyen.podcastai.entity.Category category) {
        if (category == null) {
            return null;
        }
        return com.hieunguyen.podcastai.dto.response.CategoryDto.builder()
            .id(category.getId())
            .name(category.getName())
            .description(category.getDescription())
            .slug(category.getSlug())
            .iconUrl(category.getIconUrl())
            .sortOrder(category.getSortOrder())
            .parentCategoryId(category.getParentCategory() != null ? category.getParentCategory().getId() : null)
            .parentCategoryName(category.getParentCategory() != null ? category.getParentCategory().getName() : null)
            .createdAt(category.getCreatedAt())
            .updatedAt(category.getUpdatedAt())
            .createdBy(category.getCreatedBy())
            .updatedBy(category.getUpdatedBy())
            .version(category.getVersion())
            .build();
    }
    
    /**
     * Map Tags to TagDto list (simplified)
     */
    @Named("mapTags")
    default List<com.hieunguyen.podcastai.dto.response.TagDto> mapTags(List<com.hieunguyen.podcastai.entity.Tag> tags) {
        if (tags == null || tags.isEmpty()) {
            return null;
        }
        return tags.stream()
            .map(tag -> com.hieunguyen.podcastai.dto.response.TagDto.builder()
                .id(tag.getId())
                .name(tag.getName())
                .description(tag.getDescription())
                .color(tag.getColor())
                .usageCount(tag.getUsageCount())
                .isTrending(tag.getIsTrending())
                .createdAt(tag.getCreatedAt())
                .updatedAt(tag.getUpdatedAt())
                .createdBy(tag.getCreatedBy())
                .updatedBy(tag.getUpdatedBy())
                .version(tag.getVersion())
                .build())
            .toList();
    }
}
