package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.request.user.AdminUserUpdateRequest;
import com.hieunguyen.podcastai.dto.request.user.UserStatusUpdateRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.PaginatedResponse;
import com.hieunguyen.podcastai.dto.response.UserDto;
import com.hieunguyen.podcastai.enums.UserStatus;
import com.hieunguyen.podcastai.service.UserService;
import com.hieunguyen.podcastai.util.PaginationHelper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@Slf4j
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaginatedResponse<UserDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username) {
        
        log.info("Admin getting all users - page: {}, size: {}, status: {}, email: {}, username: {}", 
                page, size, status, email, username);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<UserDto> users = userService.getAllUsers(pageable, status, email, username);
        PaginatedResponse<UserDto> paginatedResponse = PaginationHelper.toPaginatedResponse(users);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", paginatedResponse));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        log.info("Admin getting user by ID: {}", id);
        
        UserDto user = userService.getUserById(id);
        
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserUpdateRequest request) {
        log.info("Admin updating user with ID: {}", id);
        
        UserDto user = userService.updateUserByAdmin(id, request);
        
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateRequest request) {
        log.info("Admin updating status for user ID: {} to {}", id, request.getStatus());
        
        UserDto user = userService.updateUserStatus(id, request);
        
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        log.info("Admin deleting user with ID: {}", id);
        
        userService.deleteUserByAdmin(id);
        
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
}

