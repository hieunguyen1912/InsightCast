package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.PlaylistCreateRequest;
import com.hieunguyen.podcastai.dto.request.PlaylistUpdateRequest;
import com.hieunguyen.podcastai.dto.response.PlaylistDto;

import java.util.List;

public interface PlaylistService {
    List<PlaylistDto> getUserPlaylists();
    PlaylistDto getPlaylistById(Long id);
    PlaylistDto createPlaylist(PlaylistCreateRequest request);
    PlaylistDto updatePlaylist(Long id, PlaylistUpdateRequest request);
    void deletePlaylist(Long id);
}
