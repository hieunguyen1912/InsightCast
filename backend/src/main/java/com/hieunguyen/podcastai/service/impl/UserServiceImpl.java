package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.user.AdminUserUpdateRequest;
import com.hieunguyen.podcastai.dto.request.user.AvatarUploadRequest;
import com.hieunguyen.podcastai.dto.request.user.PasswordChangeRequest;
import com.hieunguyen.podcastai.dto.request.user.UserStatusUpdateRequest;
import com.hieunguyen.podcastai.dto.request.user.UserUpdateRequest;
import com.hieunguyen.podcastai.dto.response.UserDto;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.mapper.UserMapper;
import com.hieunguyen.podcastai.repository.UserRepository;
import com.hieunguyen.podcastai.service.UserRoleService;
import com.hieunguyen.podcastai.service.UserService;
import com.hieunguyen.podcastai.specification.SpecificationsBuilder;
import com.hieunguyen.podcastai.specification.SearchOperation;
import org.springframework.data.jpa.domain.Specification;
import com.hieunguyen.podcastai.util.SecurityUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.OptimisticLockException;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final SecurityUtils securityUtils;
    private final PasswordEncoder passwordEncoder;
    private final UserRoleService userRoleService;

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
        Long userId = securityUtils.getCurrentUserId();
        
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        if (request.getVersion() != null && !currentUser.getVersion().equals(request.getVersion())) {
            log.warn("Version mismatch for user {}: expected {}, but got {}", 
                    userId, request.getVersion(), currentUser.getVersion());
            throw new AppException(ErrorCode.CONCURRENT_UPDATE);
        }
        
        if (!currentUser.getUsername().equals(request.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
            }
        }
        
        if (!currentUser.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }
        }
        
        currentUser.setUsername(request.getUsername());
        currentUser.setEmail(request.getEmail());
        currentUser.setFirstName(request.getFirstName());
        currentUser.setLastName(request.getLastName());
        currentUser.setPhoneNumber(request.getPhoneNumber());
        currentUser.setDateOfBirth(request.getDateOfBirth());
        
        try {
            User updatedUser = userRepository.save(currentUser);
            log.info("Successfully updated user profile for user: {}", updatedUser.getEmail());
            return userMapper.toDto(updatedUser);
        } catch (OptimisticLockException e) {
            log.warn("Optimistic lock exception when updating user {}: {}", userId, e.getMessage());
            throw new AppException(ErrorCode.CONCURRENT_UPDATE);
        }
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

    @Override
    public Page<UserDto> getAllUsers(Pageable pageable, com.hieunguyen.podcastai.enums.UserStatus status, String email, String username) {
        log.info("Getting all users with filters - status: {}, email: {}, username: {}", status, email, username);
        
        SpecificationsBuilder<User> builder = new SpecificationsBuilder<>();
        
        if (status != null) {
            builder.with("status", ":", status, null, null);
        }
        
        if (email != null && !email.trim().isEmpty()) {
            builder.with("email", ":", email.trim(), 
                        SearchOperation.ZERO_OR_MORE_REGEX, 
                        SearchOperation.ZERO_OR_MORE_REGEX);
        }
        
        if (username != null && !username.trim().isEmpty()) {
            builder.with("username", ":", username.trim(), 
                        SearchOperation.ZERO_OR_MORE_REGEX, 
                        SearchOperation.ZERO_OR_MORE_REGEX);
        }
        
        Specification<User> spec = builder.build();
        
        if (spec == null) {
            spec = (root, query, cb) -> cb.conjunction();
        }
        
        Page<User> users = userRepository.findAll(spec, pageable);
        log.info("Found {} users with filters", users.getTotalElements());
        return users.map(userMapper::toDto);
    }

    @Override
    @Transactional
    public UserDto updateUserByAdmin(Long userId, AdminUserUpdateRequest request) {
        log.info("Admin updating user with ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        if (request.getVersion() != null && !user.getVersion().equals(request.getVersion())) {
            log.warn("Version mismatch for user {}: expected {}, but got {}", 
                    userId, request.getVersion(), user.getVersion());
            throw new AppException(ErrorCode.CONCURRENT_UPDATE);
        }
        
        if (request.getUsername() != null && !user.getUsername().equals(request.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
            }
            user.setUsername(request.getUsername());
        }
        
        if (request.getEmail() != null && !user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }
            user.setEmail(request.getEmail());
        }
        
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        
        try {
            User updatedUser = userRepository.save(user);
            log.info("Successfully updated user with ID: {} by admin", userId);
            return userMapper.toDto(updatedUser);
        } catch (OptimisticLockException e) {
            log.warn("Optimistic lock exception when updating user {}: {}", userId, e.getMessage());
            throw new AppException(ErrorCode.CONCURRENT_UPDATE);
        }
    }

    @Override
    @Transactional
    public UserDto updateUserStatus(Long userId, UserStatusUpdateRequest request) {
        log.info("Admin updating status for user ID: {} to {}", userId, request.getStatus());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        user.setStatus(request.getStatus());
        User updatedUser = userRepository.save(user);
        log.info("Successfully updated user status for user ID: {} to {}", userId, request.getStatus());
        return userMapper.toDto(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUserByAdmin(Long userId) {
        log.info("Admin deleting user with ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        user.setStatus(com.hieunguyen.podcastai.enums.UserStatus.DELETED);
        userRepository.save(user);
        log.info("Successfully deleted user with ID: {} by admin", userId);
    }
    
}
