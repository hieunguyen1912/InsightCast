package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.request.UserRegisterRequest;
import com.hieunguyen.podcastai.dto.request.UserUpdateRequest;
import com.hieunguyen.podcastai.dto.response.UserDto;
import com.hieunguyen.podcastai.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

   @Mapping(target = "passwordHash", ignore = true)
   @Mapping(target = "avatarUrl", ignore = true)
   @Mapping(target = "dateOfBirth", ignore = true)
   @Mapping(target = "role", ignore = true)
   @Mapping(target = "status", ignore = true)
   @Mapping(target = "emailVerified", ignore = true)
   @Mapping(target = "phoneVerified", ignore = true)
   @Mapping(target = "podcasts", ignore = true)
   @Mapping(target = "playlists", ignore = true)
   @Mapping(target = "favorites", ignore = true)
   User toEntity(UserRegisterRequest request);
    
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "emailVerified", ignore = true)
    @Mapping(target = "phoneVerified", ignore = true)
    @Mapping(target = "podcasts", ignore = true)
    @Mapping(target = "playlists", ignore = true)
    @Mapping(target = "favorites", ignore = true)
    User toEntity(UserUpdateRequest request);
    
    UserDto toDto(User user);
}
