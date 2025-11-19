package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.request.TtsConfigRequest;
import com.hieunguyen.podcastai.dto.request.TtsConfigUpdateRequest;
import com.hieunguyen.podcastai.dto.request.VoiceSettingsRequest;
import com.hieunguyen.podcastai.dto.response.TtsConfigDto;
import com.hieunguyen.podcastai.entity.TtsConfig;
import com.hieunguyen.podcastai.enums.AudioEncoding;
import com.hieunguyen.podcastai.enums.SampleRate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TtsConfigMapper {

    @Mapping(target = "sampleRateHertz", source = "sampleRateHertz.hertz")
    TtsConfig toEntity(TtsConfigRequest request);

    TtsConfigDto toDto(TtsConfig ttsConfig);

    List<TtsConfigDto> toDtoList(List<TtsConfig> ttsConfigs);

    void updateEntity(TtsConfigUpdateRequest request, @MappingTarget TtsConfig ttsConfig);

    @Mapping(target = "audioEncoding", source = "audioEncoding", qualifiedByName = "stringToAudioEncoding")
    @Mapping(target = "sampleRateHertz", source = "sampleRateHertz", qualifiedByName = "integerToSampleRate")
    VoiceSettingsRequest toVoiceSettingsRequest(TtsConfig ttsConfig);

    @Mapping(target = "audioEncoding", source = "audioEncoding", qualifiedByName = "audioEncodingToString")
    @Mapping(target = "sampleRateHertz", source = "sampleRateHertz", qualifiedByName = "sampleRateToInteger")
    TtsConfig toEntityFromVoiceSettings(VoiceSettingsRequest voiceSettings);

    @Named("instantToLocalDateTime")
    default LocalDateTime instantToLocalDateTime(Instant instant) {
        if (instant == null) {
            return null;
        }
        return instant.atZone(ZoneId.systemDefault()).toLocalDateTime();
    }

    @Named("stringToAudioEncoding")
    default AudioEncoding stringToAudioEncoding(String audioEncoding) {
        if (audioEncoding == null) {
            return AudioEncoding.MP3;
        }
        try {
            return AudioEncoding.valueOf(audioEncoding);
        } catch (IllegalArgumentException e) {
            return AudioEncoding.MP3;
        }
    }

    @Named("audioEncodingToString")
    default String audioEncodingToString(AudioEncoding audioEncoding) {
        return audioEncoding != null ? audioEncoding.getValue() : "MP3";
    }

    @Named("integerToSampleRate")
    default SampleRate integerToSampleRate(Integer sampleRateHertz) {
        if (sampleRateHertz == null) {
            return SampleRate.DEFAULT;
        }
        SampleRate rate = SampleRate.fromHertz(sampleRateHertz);
        return rate != null ? rate : SampleRate.DEFAULT;
    }

    @Named("sampleRateToInteger")
    default Integer sampleRateToInteger(SampleRate sampleRate) {
        return sampleRate != null ? sampleRate.getHertz() : SampleRate.DEFAULT.getHertz();
    }
}
