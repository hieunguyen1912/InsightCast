package com.hieunguyen.podcastai.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hieunguyen.podcastai.dto.request.user.AvatarUploadRequest;
import com.hieunguyen.podcastai.dto.request.user.PasswordChangeRequest;
import com.hieunguyen.podcastai.dto.request.user.UserUpdateRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.UserDto;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/user")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "User Controller")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get current user profile")
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
        
        ResponseEntity.BodyBuilder responseBuilder = ResponseEntity.ok();
        

        if (request.getEmail() != null && !request.getEmail().equals(userDto.getEmail())) {
            responseBuilder.header("X-Token-Refresh-Required", "true");
            responseBuilder.header("X-Token-Refresh-Reason", "email-changed");
        }
        
        return responseBuilder.body(ApiResponse.success("Profile updated successfully", userDto));
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

    @GetMapping( "/advance-search-with-specification")
    public ResponseEntity<ApiResponse<List<UserDto>>> search(Pageable pageable, @RequestParam(value = "search", required = false) String... search) {
        Page<UserDto> users = userService.searchUserBySpecification(pageable, search);

        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users.getContent(), ApiResponse.PageInfo.from(users)));
    }
}
