package com.hieunguyen.podcastai.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hieunguyen.podcastai.entity.FetchConfiguration;

@Repository
public interface FetchConfigurationRepository extends JpaRepository<FetchConfiguration, Long> {
    
}
