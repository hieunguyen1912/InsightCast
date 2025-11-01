package com.hieunguyen.podcastai.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.hieunguyen.podcastai.dto.request.FetchConfigurationRequest;
import com.hieunguyen.podcastai.dto.response.FetchConfigurationDto;
import com.hieunguyen.podcastai.entity.FetchConfiguration;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface FetchConfigurationMapper {

    FetchConfiguration toEntity(FetchConfigurationRequest request);
    FetchConfigurationDto toDto(FetchConfiguration fetchConfiguration);
    List<FetchConfigurationDto> toDtoList(List<FetchConfiguration> fetchConfigurations);
    void updateEntity(FetchConfigurationRequest request, @MappingTarget FetchConfiguration fetchConfiguration);
    FetchConfiguration toEntityForUpdate(FetchConfigurationRequest request);
}