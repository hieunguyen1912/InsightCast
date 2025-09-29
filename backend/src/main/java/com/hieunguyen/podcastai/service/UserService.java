package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.AvatarUploadRequest;
import com.hieunguyen.podcastai.dto.request.PasswordChangeRequest;
import com.hieunguyen.podcastai.dto.request.UserUpdateRequest;
import com.hieunguyen.podcastai.dto.response.UserDto;

public interface UserService {
   UserDto getMe();
   UserDto getUserById(Long id);
   UserDto updateProfile(UserUpdateRequest request);
   void changePassword(PasswordChangeRequest request);
   UserDto uploadAvatar(AvatarUploadRequest request);
   void deleteAccount();
}
