package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.request.UserRoleAssignmentRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.RoleDto;
import com.hieunguyen.podcastai.service.UserRoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users/{userId}/roles")
@Slf4j
@RequiredArgsConstructor
public class UserRoleController {
    
    private final UserRoleService userRoleService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<RoleDto>>> getUserRoles(@PathVariable Long userId) {
        log.info("Getting roles for user ID: {}", userId);
        
        List<RoleDto> roles = userRoleService.getUserRoles(userId);
        
        return ResponseEntity.ok(ApiResponse.success("User roles retrieved successfully", roles));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleDto>> assignRoleToUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserRoleAssignmentRequest request) {
        log.info("Assigning role ID {} to user ID {}", request.getRoleId(), userId);
        
        RoleDto role = userRoleService.assignRoleToUser(userId, request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Role assigned successfully", role));
    }

    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> revokeRoleFromUser(
            @PathVariable Long userId,
            @PathVariable Long roleId) {
        log.info("Revoking role ID {} from user ID {}", roleId, userId);
        
        userRoleService.revokeRoleFromUser(userId, roleId);
        
        return ResponseEntity.ok(ApiResponse.success("Role revoked successfully", null));
    }
}

