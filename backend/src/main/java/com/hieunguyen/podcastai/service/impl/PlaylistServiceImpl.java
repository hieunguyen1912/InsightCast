package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.PlaylistCreateRequest;
import com.hieunguyen.podcastai.dto.request.PlaylistUpdateRequest;
import com.hieunguyen.podcastai.dto.response.PlaylistDto;
import com.hieunguyen.podcastai.entity.Playlist;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.mapper.PlaylistMapper;
import com.hieunguyen.podcastai.repository.PlaylistRepository;
import com.hieunguyen.podcastai.service.PlaylistService;
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
public class PlaylistServiceImpl implements PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistMapper playlistMapper;
    private final SecurityUtils securityUtils;

    @Override
    public List<PlaylistDto> getUserPlaylists() {
        log.debug("Retrieving user playlists");
        User currentUser = securityUtils.getCurrentUser();
        List<Playlist> playlists = playlistRepository.findByUserId(currentUser.getId());
        log.debug("Found {} playlists for user: {}", playlists.size(), currentUser.getEmail());
        return playlists.stream()
                .map(playlistMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public PlaylistDto getPlaylistById(Long id) {
        log.debug("Retrieving playlist by ID: {}", id);
        User currentUser = securityUtils.getCurrentUser();
        Playlist playlist = playlistRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        log.debug("Found playlist: {} for user: {}", playlist.getName(), currentUser.getEmail());
        return playlistMapper.toDto(playlist);
    }

    @Override
    @Transactional
    public PlaylistDto createPlaylist(PlaylistCreateRequest request) {
        log.info("Creating playlist: {}", request.getName());
        User currentUser = securityUtils.getCurrentUser();
        
        Playlist playlist = playlistMapper.toEntity(request);
        playlist.setUser(currentUser);
        
        Playlist savedPlaylist = playlistRepository.save(playlist);
        log.info("Successfully created playlist: {} for user: {}", savedPlaylist.getName(), currentUser.getEmail());
        return playlistMapper.toDto(savedPlaylist);
    }

    @Override
    @Transactional
    public PlaylistDto updatePlaylist(Long id, PlaylistUpdateRequest request) {
        log.info("Updating playlist with ID: {}", id);
        User currentUser = securityUtils.getCurrentUser();
        
        Playlist playlist = playlistRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        playlist.setName(request.getName());
        playlist.setDescription(request.getDescription());
        if (request.getVisibility() != null) {
            playlist.setVisibility(request.getVisibility());
        }
        
        Playlist updatedPlaylist = playlistRepository.save(playlist);
        log.info("Successfully updated playlist: {} for user: {}", updatedPlaylist.getName(), currentUser.getEmail());
        return playlistMapper.toDto(updatedPlaylist);
    }

    @Override
    @Transactional
    public void deletePlaylist(Long id) {
        log.info("Deleting playlist with ID: {}", id);
        User currentUser = securityUtils.getCurrentUser();
        
        Playlist playlist = playlistRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        playlistRepository.delete(playlist);
        log.info("Successfully deleted playlist: {} for user: {}", playlist.getName(), currentUser.getEmail());
    }

}
