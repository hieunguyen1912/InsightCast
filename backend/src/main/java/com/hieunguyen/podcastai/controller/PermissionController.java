package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.PermissionDto;
import com.hieunguyen.podcastai.service.PermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/permissions")
@Slf4j
@RequiredArgsConstructor
public class PermissionController {
    
    private final PermissionService permissionService;

    /**
     * GET /api/v1/permissions - Danh sách permissions (có phân trang)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<PermissionDto>>> getAllPermissions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "code") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        log.info("Getting all permissions with pagination: page={}, size={}, sortBy={}, sortDirection={}", 
                page, size, sortBy, sortDirection);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<PermissionDto> permissions = permissionService.getAllPermissions(pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Permissions retrieved successfully", permissions));
    }

    /**
     * GET /api/v1/permissions/all - Danh sách tất cả permissions (không phân trang)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PermissionDto>>> getAllPermissionsList() {
        log.info("Getting all permissions (without pagination)");
        
        List<PermissionDto> permissions = permissionService.getAllPermissions();
        
        return ResponseEntity.ok(ApiResponse.success("Permissions retrieved successfully", permissions));
    }

    /**
     * GET /api/v1/permissions/{id} - Chi tiết permission
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PermissionDto>> getPermissionById(@PathVariable Long id) {
        log.info("Getting permission by ID: {}", id);
        
        PermissionDto permission = permissionService.getPermissionById(id);
        
        return ResponseEntity.ok(ApiResponse.success("Permission retrieved successfully", permission));
    }
}

