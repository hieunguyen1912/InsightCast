package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.AvatarUploadRequest;
import com.hieunguyen.podcastai.dto.request.PasswordChangeRequest;
import com.hieunguyen.podcastai.dto.request.UserUpdateRequest;
import com.hieunguyen.podcastai.dto.response.UserDto;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.mapper.UserMapper;
import com.hieunguyen.podcastai.repository.UserRepository;
import com.hieunguyen.podcastai.service.UserService;
import com.hieunguyen.podcastai.util.SecurityUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final SecurityUtils securityUtils;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDto getMe() {
        log.debug("Retrieving current user profile");
        User user = securityUtils.getCurrentUser();
        log.debug("User found: {} with ID: {}", user.getEmail(), user.getId());
        return userMapper.toDto(user);
    }

    @Override
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toDto(user);
    }

    @Override
    @Transactional
    public UserDto updateProfile(UserUpdateRequest request) {
        log.info("Updating user profile");
        User currentUser = securityUtils.getCurrentUser();
        
        // Check if username is already taken by another user
        if (!currentUser.getUsername().equals(request.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
            }
        }
        
        // Check if email is already taken by another user
        if (!currentUser.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }
        }
        
        // Update user fields
        currentUser.setUsername(request.getUsername());
        currentUser.setEmail(request.getEmail());
        currentUser.setFirstName(request.getFirstName());
        currentUser.setLastName(request.getLastName());
        currentUser.setPhoneNumber(request.getPhoneNumber());
        currentUser.setDateOfBirth(request.getDateOfBirth());
        
        User updatedUser = userRepository.save(currentUser);
        log.info("Successfully updated user profile for user: {}", updatedUser.getEmail());
        return userMapper.toDto(updatedUser);
    }

    @Override
    @Transactional
    public void changePassword(PasswordChangeRequest request) {
        log.info("Changing user password");
        User currentUser = securityUtils.getCurrentUser();
        
        // Validate current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPasswordHash())) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }
        
        // Validate new password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_MISMATCH);
        }
        
        // Update password
        currentUser.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(currentUser);
        log.info("Successfully changed password for user: {}", currentUser.getEmail());
    }

    @Override
    @Transactional
    public UserDto uploadAvatar(AvatarUploadRequest request) {
        log.info("Uploading user avatar");
        User currentUser = securityUtils.getCurrentUser();
        
        // Update avatar URL
        currentUser.setAvatarUrl(request.getAvatarUrl());
        User updatedUser = userRepository.save(currentUser);
        log.info("Successfully uploaded avatar for user: {}", updatedUser.getEmail());
        return userMapper.toDto(updatedUser);
    }

    @Override
    @Transactional
    public void deleteAccount() {
        log.info("Deleting user account");
        User currentUser = securityUtils.getCurrentUser();
        
        // Soft delete by setting status to INACTIVE
        currentUser.setStatus(com.hieunguyen.podcastai.enums.UserStatus.INACTIVE);
        userRepository.save(currentUser);
        log.info("Successfully deleted account for user: {}", currentUser.getEmail());
    }
    
}
