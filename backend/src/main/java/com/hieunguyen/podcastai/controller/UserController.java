package com.hieunguyen.podcastai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hieunguyen.podcastai.dto.request.AvatarUploadRequest;
import com.hieunguyen.podcastai.dto.request.PasswordChangeRequest;
import com.hieunguyen.podcastai.dto.request.UserUpdateRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.UserDto;
import com.hieunguyen.podcastai.service.UserService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/user")
@Slf4j
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<UserDto>> getMe() {
        log.info("Getting current user profile");
        UserDto userDto = userService.getMe();
        log.info("Successfully retrieved user profile for user: {}", userDto.getEmail());
        return ResponseEntity.ok(ApiResponse.success("User fetched successfully", userDto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        log.info("Getting user profile by ID: {}", id);
        UserDto userDto = userService.getUserById(id);
        log.info("Successfully retrieved user profile for user: {}", userDto.getEmail());
        return ResponseEntity.ok(ApiResponse.success("User fetched successfully", userDto));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(@Valid @RequestBody UserUpdateRequest request) {
        log.info("Updating user profile");
        UserDto userDto = userService.updateProfile(request);
        log.info("Successfully updated user profile for user: {}", userDto.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", userDto));
    }

    @PutMapping("/me/password")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody PasswordChangeRequest request) {
        log.info("Changing user password");
        userService.changePassword(request);
        log.info("Successfully changed password");
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PostMapping("/me/avatar")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<UserDto>> uploadAvatar(@Valid @RequestBody AvatarUploadRequest request) {
        log.info("Uploading user avatar");
        UserDto userDto = userService.uploadAvatar(request);
        log.info("Successfully uploaded avatar for user: {}", userDto.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Avatar uploaded successfully", userDto));
    }

    @DeleteMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Void>> deleteAccount() {
        log.info("Deleting user account");
        userService.deleteAccount();
        log.info("Successfully deleted account");
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully", null));
    }
}
