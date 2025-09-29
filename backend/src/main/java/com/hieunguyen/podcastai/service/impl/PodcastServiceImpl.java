package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.PodcastCreateRequest;
import com.hieunguyen.podcastai.dto.request.PodcastUpdateRequest;
import com.hieunguyen.podcastai.dto.response.PodcastDto;
import com.hieunguyen.podcastai.entity.Category;
import com.hieunguyen.podcastai.entity.Podcast;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.mapper.PodcastMapper;
import com.hieunguyen.podcastai.repository.CategoryRepository;
import com.hieunguyen.podcastai.repository.PodcastRepository;
import com.hieunguyen.podcastai.service.PodcastService;
import com.hieunguyen.podcastai.util.SecurityUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PodcastServiceImpl implements PodcastService {

    private final PodcastRepository podcastRepository;
    private final CategoryRepository categoryRepository;
    private final PodcastMapper podcastMapper;
    private final SecurityUtils securityUtils;

    @Override
    public List<PodcastDto> getUserPodcasts() {
        log.debug("Retrieving user podcasts");
        User currentUser = securityUtils.getCurrentUser();
        List<Podcast> podcasts = podcastRepository.findByUserId(currentUser.getId());
        log.debug("Found {} podcasts for user: {}", podcasts.size(), currentUser.getEmail());
        return podcasts.stream()
                .map(podcastMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public PodcastDto getPodcastById(Long id) {
        log.debug("Retrieving podcast by ID: {}", id);
        User currentUser = securityUtils.getCurrentUser();
        Podcast podcast = podcastRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        log.debug("Found podcast: {} for user: {}", podcast.getTitle(), currentUser.getEmail());
        return podcastMapper.toDto(podcast);
    }

    @Override
    @Transactional
    public PodcastDto createPodcast(PodcastCreateRequest request) {
        log.info("Creating podcast: {}", request.getTitle());
        User currentUser = securityUtils.getCurrentUser();
        
        // Validate category exists if provided
        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        }
        
        Podcast podcast = podcastMapper.toEntity(request);
        podcast.setUser(currentUser);
        
        Podcast savedPodcast = podcastRepository.save(podcast);
        log.info("Successfully created podcast: {} for user: {}", savedPodcast.getTitle(), currentUser.getEmail());
        return podcastMapper.toDto(savedPodcast);
    }

    @Override
    @Transactional
    public PodcastDto updatePodcast(Long id, PodcastUpdateRequest request) {
        log.info("Updating podcast with ID: {}", id);
        User currentUser = securityUtils.getCurrentUser();
        
        Podcast podcast = podcastRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        podcast.setTitle(request.getTitle());
        podcast.setDescription(request.getDescription());
        if (request.getVisibility() != null) {
            podcast.setVisibility(request.getVisibility());
        }
        if (request.getImageUrl() != null) {
            podcast.setCoverImageUrl(request.getImageUrl());
        }
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
            podcast.getCategories().clear();
            podcast.getCategories().add(category);
        }
        
        Podcast updatedPodcast = podcastRepository.save(podcast);
        log.info("Successfully updated podcast: {} for user: {}", updatedPodcast.getTitle(), currentUser.getEmail());
        return podcastMapper.toDto(updatedPodcast);
    }

    @Override
    @Transactional
    public void deletePodcast(Long id) {
        log.info("Deleting podcast with ID: {}", id);
        User currentUser = securityUtils.getCurrentUser();
        
        Podcast podcast = podcastRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        podcastRepository.delete(podcast);
        log.info("Successfully deleted podcast: {} for user: {}", podcast.getTitle(), currentUser.getEmail());
    }

}
