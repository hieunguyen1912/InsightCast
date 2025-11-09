package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.request.CategoryRequest;
import com.hieunguyen.podcastai.dto.request.CategoryUpdateRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.BreadcrumbDto;
import com.hieunguyen.podcastai.dto.response.CategoryDto;
import com.hieunguyen.podcastai.dto.response.NewsArticleSummaryResponse;
import com.hieunguyen.podcastai.dto.response.PaginatedResponse;
import com.hieunguyen.podcastai.util.PaginationHelper;
import com.hieunguyen.podcastai.service.CategoryService;
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
@RequestMapping("/api/v1/categories")
@Slf4j
@RequiredArgsConstructor
public class CategoryController {
    
    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody CategoryRequest request) {
        log.info("Creating category with name: {}", request.getName());
        
        CategoryDto category = categoryService.createCategory(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Category created successfully", category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryById(@PathVariable Long id) {
        log.info("Getting category by ID: {}", id);
        
        CategoryDto category = categoryService.getCategoryById(id);
        
        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", category));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryBySlug(@PathVariable String slug) {
        log.info("Getting category by slug: {}", slug);
        
        CategoryDto category = categoryService.getCategoryBySlug(slug);
        
        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(@PathVariable Long id,
                                                                  @Valid @RequestBody CategoryUpdateRequest request) {
        log.info("Updating category with ID: {}", id);
        
        CategoryDto category = categoryService.updateCategory(id, request);
        
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", category));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        log.info("Deleting category with ID: {}", id);
        
        categoryService.deleteCategory(id);
        
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<CategoryDto>>> getAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "sortOrder") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        log.info("Getting all categories with pagination: page={}, size={}, sortBy={}, sortDirection={}", 
                page, size, sortBy, sortDirection);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<CategoryDto> categories = categoryService.getAllCategories(pageable);
        PaginatedResponse<CategoryDto> paginatedResponse = PaginationHelper.toPaginatedResponse(categories);
        
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", paginatedResponse));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        log.info("Getting all categories");

        List<CategoryDto> categories = categoryService.getAllCategories();

        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }


    @GetMapping("/tree")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategoryTree() {
        log.info("Getting category tree");
        
        List<CategoryDto> categoryTree = categoryService.getCategoryTree();
        
        return ResponseEntity.ok(ApiResponse.success("Category tree retrieved successfully", categoryTree));
    }
    
    /**
     * Get root categories only
     */
    @GetMapping("/root")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getRootCategories() {
        log.info("Getting root categories");
        
        List<CategoryDto> rootCategories = categoryService.getRootCategories();
        
        return ResponseEntity.ok(ApiResponse.success("Root categories retrieved successfully", rootCategories));
    }
    
    /**
     * Get children of a category
     */
    @GetMapping("/{id}/children")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategoryChildren(@PathVariable Long id) {
        log.info("Getting children of category with ID: {}", id);
        
        List<CategoryDto> children = categoryService.getCategoryChildren(id);
        
        return ResponseEntity.ok(ApiResponse.success("Category children retrieved successfully", children));
    }
    
    /**
     * Get breadcrumb path for a category
     */
    @GetMapping("/{id}/breadcrumb")
    public ResponseEntity<ApiResponse<List<BreadcrumbDto>>> getCategoryBreadcrumb(@PathVariable Long id) {
        log.info("Getting breadcrumb for category with ID: {}", id);
        
        List<BreadcrumbDto> breadcrumbs = categoryService.getCategoryBreadcrumb(id);
        
        return ResponseEntity.ok(ApiResponse.success("Category breadcrumb retrieved successfully", breadcrumbs));
    }
}
