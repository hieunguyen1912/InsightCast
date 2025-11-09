package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.request.RoleRequest;
import com.hieunguyen.podcastai.dto.request.RoleUpdateRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.RoleDto;
import com.hieunguyen.podcastai.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@Slf4j
@RequiredArgsConstructor
public class RoleController {
    
    private final RoleService roleService;

    /**
     * GET /api/v1/roles - Danh sách roles (có phân trang)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<RoleDto>>> getAllRoles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        log.info("Getting all roles with pagination: page={}, size={}, sortBy={}, sortDirection={}", 
                page, size, sortBy, sortDirection);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<RoleDto> roles = roleService.getAllRoles(pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Roles retrieved successfully", roles));
    }

    /**
     * GET /api/v1/roles/all - Danh sách tất cả roles (không phân trang)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<RoleDto>>> getAllRolesList() {
        log.info("Getting all roles (without pagination)");
        
        List<RoleDto> roles = roleService.getAllRoles();
        
        return ResponseEntity.ok(ApiResponse.success("Roles retrieved successfully", roles));
    }

    /**
     * GET /api/v1/roles/{id} - Chi tiết role
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleDto>> getRoleById(@PathVariable Long id) {
        log.info("Getting role by ID: {}", id);
        
        RoleDto role = roleService.getRoleById(id);
        
        return ResponseEntity.ok(ApiResponse.success("Role retrieved successfully", role));
    }

    /**
     * GET /api/v1/roles/code/{code} - Lấy role theo code
     */
    @GetMapping("/code/{code}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleDto>> getRoleByCode(@PathVariable String code) {
        log.info("Getting role by code: {}", code);
        
        RoleDto role = roleService.getRoleByCode(code);
        
        return ResponseEntity.ok(ApiResponse.success("Role retrieved successfully", role));
    }

    /**
     * POST /api/v1/roles - Tạo role mới
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleDto>> createRole(@Valid @RequestBody RoleRequest request) {
        log.info("Creating role with code: {}", request.getCode());
        
        RoleDto role = roleService.createRole(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Role created successfully", role));
    }

    /**
     * PUT /api/v1/roles/{id} - Cập nhật role
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleDto>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest request) {
        log.info("Updating role with ID: {}", id);
        
        RoleDto role = roleService.updateRole(id, request);
        
        return ResponseEntity.ok(ApiResponse.success("Role updated successfully", role));
    }

    /**
     * DELETE /api/v1/roles/{id} - Xóa role (soft delete)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable Long id) {
        log.info("Deleting (soft delete) role with ID: {}", id);
        
        roleService.deleteRole(id);
        
        return ResponseEntity.ok(ApiResponse.success("Role deleted successfully", null));
    }

    /**
     * PUT /api/v1/roles/{id}/activate - Kích hoạt lại role
     */
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleDto>> activateRole(@PathVariable Long id) {
        log.info("Activating role with ID: {}", id);
        
        RoleDto role = roleService.activateRole(id);
        
        return ResponseEntity.ok(ApiResponse.success("Role activated successfully", role));
    }
}

