package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.response.AudioFileDto;
import com.hieunguyen.podcastai.entity.AudioFile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, uses = {UserMapper.class})
public interface AudioMapper {

    @Mapping(target = "articleId", source = "newsArticle.id")    
    AudioFileDto toDto(AudioFile audioFile);

    List<AudioFileDto> toDtoList(List<AudioFile> audioFiles);

    AudioFile toEntity(AudioFileDto audioFileDto);
}
