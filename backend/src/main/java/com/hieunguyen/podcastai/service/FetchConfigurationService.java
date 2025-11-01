package com.hieunguyen.podcastai.service;

import java.util.List;

import com.hieunguyen.podcastai.dto.request.FetchConfigurationRequest;
import com.hieunguyen.podcastai.dto.response.FetchConfigurationDto;
import com.hieunguyen.podcastai.entity.FetchConfiguration;

public interface FetchConfigurationService {
    FetchConfigurationDto createFetchConfiguration(FetchConfigurationRequest request);
    FetchConfiguration getFetchConfigurationById(Long id);
    FetchConfiguration updateFetchConfiguration(Long id, FetchConfigurationRequest request);
    void deleteFetchConfiguration(Long id);
    List<FetchConfiguration> getAllFetchConfigurations();
    
}
