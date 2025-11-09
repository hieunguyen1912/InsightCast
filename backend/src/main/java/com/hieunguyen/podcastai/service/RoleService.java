package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.RoleRequest;
import com.hieunguyen.podcastai.dto.request.RoleUpdateRequest;
import com.hieunguyen.podcastai.dto.response.RoleDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RoleService {
    
    /**
     * Lấy danh sách tất cả roles (có phân trang)
     */
    Page<RoleDto> getAllRoles(Pageable pageable);
    
    /**
     * Lấy danh sách tất cả roles (không phân trang)
     */
    List<RoleDto> getAllRoles();
    
    /**
     * Lấy role theo ID
     */
    RoleDto getRoleById(Long id);
    
    /**
     * Lấy role theo code
     */
    RoleDto getRoleByCode(String code);
    
    /**
     * Tạo role mới
     */
    RoleDto createRole(RoleRequest request);
    
    /**
     * Cập nhật role
     */
    RoleDto updateRole(Long id, RoleUpdateRequest request);
    
    /**
     * Xóa role (soft delete - set isActive = false)
     */
    void deleteRole(Long id);
    
    /**
     * Kích hoạt lại role (set isActive = true)
     */
    RoleDto activateRole(Long id);
}

