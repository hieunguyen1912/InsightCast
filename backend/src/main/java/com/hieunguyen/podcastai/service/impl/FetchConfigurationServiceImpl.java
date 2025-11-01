package com.hieunguyen.podcastai.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.hieunguyen.podcastai.dto.request.FetchConfigurationRequest;
import com.hieunguyen.podcastai.dto.response.FetchConfigurationDto;
import com.hieunguyen.podcastai.entity.FetchConfiguration;
import com.hieunguyen.podcastai.mapper.FetchConfigurationMapper;
import com.hieunguyen.podcastai.repository.FetchConfigurationRepository;
import com.hieunguyen.podcastai.service.FetchConfigurationService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class FetchConfigurationServiceImpl implements FetchConfigurationService{

    private final FetchConfigurationRepository fetchConfigurationRepository;
    private final FetchConfigurationMapper fetchConfigurationMapper;

    @Override
    public FetchConfigurationDto createFetchConfiguration(FetchConfigurationRequest request) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'createFetchConfiguration'");
    }

    @Override
    public FetchConfiguration getFetchConfigurationById(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getFetchConfigurationById'");
    }

    @Override
    public FetchConfiguration updateFetchConfiguration(Long id, FetchConfigurationRequest request) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'updateFetchConfiguration'");
    }

    @Override
    public void deleteFetchConfiguration(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'deleteFetchConfiguration'");
    }

    @Override
    public List<FetchConfiguration> getAllFetchConfigurations() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getAllFetchConfigurations'");
    }
    
}
