package com.hieunguyen.podcastai.mapper;

import com.hieunguyen.podcastai.dto.request.user.UserRegisterRequest;
import com.hieunguyen.podcastai.dto.request.user.UserUpdateRequest;
import com.hieunguyen.podcastai.dto.response.UserDto;
import com.hieunguyen.podcastai.entity.Role;
import com.hieunguyen.podcastai.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toEntity(UserRegisterRequest request);

    User toEntity(UserUpdateRequest request);

    @Mapping(target = "roles", source = "roles", qualifiedByName = "mapRolesToCodes")
    UserDto toDto(User user);

    @Named("mapRolesToCodes")
    default List<String> mapRolesToCodes(Set<Role> roles) {
        if (roles == null) return null;
        return roles.stream()
                .map(Role::getCode)
                .collect(Collectors.toList());
    }
}
