package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.PodcastCreateRequest;
import com.hieunguyen.podcastai.dto.request.PodcastUpdateRequest;
import com.hieunguyen.podcastai.dto.response.PodcastDto;

import java.util.List;

public interface PodcastService {
    List<PodcastDto> getUserPodcasts();
    PodcastDto getPodcastById(Long id);
    PodcastDto createPodcast(PodcastCreateRequest request);
    PodcastDto updatePodcast(Long id, PodcastUpdateRequest request);
    void deletePodcast(Long id);
}
