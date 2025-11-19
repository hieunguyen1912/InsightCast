package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.user.AdminUserUpdateRequest;
import com.hieunguyen.podcastai.dto.request.user.AvatarUploadRequest;
import com.hieunguyen.podcastai.dto.request.user.PasswordChangeRequest;
import com.hieunguyen.podcastai.dto.request.user.UserStatusUpdateRequest;
import com.hieunguyen.podcastai.dto.request.user.UserUpdateRequest;
import com.hieunguyen.podcastai.dto.response.UserDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
   UserDto getMe();
   UserDto getUserById(Long id);
   UserDto updateProfile(UserUpdateRequest request);
   void changePassword(PasswordChangeRequest request);
   UserDto uploadAvatar(AvatarUploadRequest request);
   void deleteAccount();

   // Admin methods
   Page<UserDto> getAllUsers(Pageable pageable, com.hieunguyen.podcastai.enums.UserStatus status, String email, String username);
   UserDto updateUserByAdmin(Long userId, AdminUserUpdateRequest request);
   UserDto updateUserStatus(Long userId, UserStatusUpdateRequest request);
   void deleteUserByAdmin(Long userId);
}
