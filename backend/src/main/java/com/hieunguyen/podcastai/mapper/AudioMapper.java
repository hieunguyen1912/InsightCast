package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.request.AudioRequest;
import com.hieunguyen.podcastai.dto.response.AudioFileDto;
import com.hieunguyen.podcastai.entity.AudioFile;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, uses = {UserMapper.class})
public interface AudioMapper {
    
    AudioFileDto toDto(AudioFile audioFile);
    
    List<AudioFileDto> toDtoList(List<AudioFile> audioFiles);

    AudioFile toEntity(AudioFileDto audioFileDto);
}
