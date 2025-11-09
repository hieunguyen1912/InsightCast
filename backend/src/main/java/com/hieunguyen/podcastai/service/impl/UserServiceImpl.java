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

    @Override
    public Page<UserDto> searchUserBySpecification(Pageable pageable, String ...search) {

        SpecificationsBuilder<User> builder = new SpecificationsBuilder<>();

        if (search.length > 0) {
            Pattern pattern = Pattern.compile("(\\w+)([<:>~!])(\\*?)([^*]*)(\\*?)");
            for (String s : search) {
                Matcher matcher = pattern.matcher(s);
                if (matcher.find()) {
                    String key = matcher.group(1);
                    String operation = matcher.group(2);
                    String prefix = matcher.group(3);
                    String value = matcher.group(4);
                    String suffix = matcher.group(5);

                    builder.with(key, operation, value, prefix, suffix);
                }
            }

            Page<User> users = userRepository.findAll(Objects.requireNonNull(builder.build()), pageable);

            return users.map(userMapper::toDto);
        }
        return userRepository.findAll(pageable).map(userMapper::toDto);
    }

    @Override
    public Page<UserDto> getAllUsers(Pageable pageable) {
        log.info("Getting all users with pagination");
        Page<User> users = userRepository.findAll(pageable);
        log.info("Found {} users", users.getTotalElements());
        return users.map(userMapper::toDto);
    }

    @Override
    @Transactional
    public UserDto updateUserByAdmin(Long userId, AdminUserUpdateRequest request) {
        log.info("Admin updating user with ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Check if username is already taken by another user
        if (request.getUsername() != null && !user.getUsername().equals(request.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
            }
            user.setUsername(request.getUsername());
        }
        
        // Check if email is already taken by another user
        if (request.getEmail() != null && !user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }
            user.setEmail(request.getEmail());
        }
        
        // Update user fields (only if provided)
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
        
        User updatedUser = userRepository.save(user);
        log.info("Successfully updated user with ID: {} by admin", userId);
        return userMapper.toDto(updatedUser);
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
        
        // Soft delete by setting status to DELETED
        user.setStatus(com.hieunguyen.podcastai.enums.UserStatus.DELETED);
        userRepository.save(user);
        log.info("Successfully deleted user with ID: {} by admin", userId);
    }
    
}
