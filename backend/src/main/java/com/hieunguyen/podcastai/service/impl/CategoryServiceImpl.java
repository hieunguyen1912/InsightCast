package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.dto.request.CategoryRequest;
import com.hieunguyen.podcastai.dto.request.CategoryUpdateRequest;
import com.hieunguyen.podcastai.dto.response.BreadcrumbDto;
import com.hieunguyen.podcastai.dto.response.CategoryDto;
import com.hieunguyen.podcastai.entity.Category;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.mapper.CategoryMapper;
import com.hieunguyen.podcastai.repository.CategoryRepository;
import com.hieunguyen.podcastai.service.CategoryService;
import com.hieunguyen.podcastai.util.SlugHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {
    
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    
    @Override
    public CategoryDto createCategory(CategoryRequest request) {
        log.info("Creating category with name: {}", request.getName());
        
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new AppException(ErrorCode.CATEGORY_NAME_EXISTS);
        }
        
        String slug = SlugHelper.generateSlug(request.getName());
        
        String originalSlug = slug;
        int counter = 1;
        while (categoryRepository.existsBySlugIgnoreCase(slug)) {
            slug = originalSlug + "-" + counter;
            counter++;
        }
        
        Category category = categoryMapper.toEntity(request);
        category.setSlug(slug);
        
        // Calculate level and path based on parent
        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            category.setParent(parent);
            category.setLevel(parent.getLevel() + 1);
            category.setPath(parent.getPath() + "/" + slug);
        } else {
            // Root category
            category.setLevel(0);
            category.setPath("/" + slug);
        }
        
        Category savedCategory = categoryRepository.save(category);
        log.info("Successfully created category with ID: {}, slug: {}, level: {}, path: {}", 
                savedCategory.getId(), savedCategory.getSlug(), savedCategory.getLevel(), savedCategory.getPath());
        
        return categoryMapper.toDto(savedCategory);
    }
    
    @Override
    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(Long id) {
        log.info("Getting category by ID: {}", id);
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        
        return categoryMapper.toDto(category);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDto getCategoryBySlug(String slug) {
        log.info("Getting category by slug: {}", slug);
        
        Category category = categoryRepository.findBySlugIgnoreCase(slug)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_SLUG_NOT_FOUND));
        
        return categoryMapper.toDto(category);
    }
    
    @Override
    public CategoryDto updateCategory(Long id, CategoryUpdateRequest request) {
        log.info("Updating category with ID: {}", id);
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (request.getName() != null && !request.getName().equals(category.getName())) {
            if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
                throw new AppException(ErrorCode.CATEGORY_NAME_EXISTS);
            }
        }

        categoryMapper.updateEntity(request, category);
        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(
                            () -> new AppException(ErrorCode.CATEGORY_NOT_FOUND)
                    );
            category.setParent(parent);
        } else {
            category.setParent(null);
        }
        Category updatedCategory = categoryRepository.save(category);
        
        log.info("Successfully updated category with ID: {}", updatedCategory.getId());
        return categoryMapper.toDto(updatedCategory);
    }
    
    @Override
    public void deleteCategory(Long id) {
        log.info("Deleting category with ID: {}", id);
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        categoryRepository.delete(category);
        log.info("Successfully deleted category with ID: {}", id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<CategoryDto> getAllCategories(Pageable pageable) {
        log.info("Getting all categories with pagination: {}", pageable);
        
        Page<Category> categories = categoryRepository.findAll(pageable);
        return categories.map(categoryMapper::toDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        log.info("Getting all categories");
        
        List<Category> categories = categoryRepository.findAll();
        return categoryMapper.toDtoList(categories);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> getCategoryTree() {
        log.info("Getting category tree");
        
        List<Category> rootCategories = categoryRepository.findByParentIsNull();
        return rootCategories.stream()
                .map(this::buildCategoryTree)
                .toList();
    }
    
    private CategoryDto buildCategoryTree(Category category) {
        CategoryDto dto = categoryMapper.toDto(category);
        
        List<Category> children = categoryRepository.findByParentId(category.getId());
        if (!children.isEmpty()) {
            List<CategoryDto> childrenDtos = children.stream()
                    .map(this::buildCategoryTree)
                    .toList();
            dto.setChildren(childrenDtos);
        }
        
        return dto;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> getRootCategories() {
        log.info("Getting root categories");
        
        List<Category> rootCategories = categoryRepository.findByParentIsNull();
        return categoryMapper.toDtoList(rootCategories);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> getCategoryChildren(Long id) {
        log.info("Getting children of category with ID: {}", id);
        
        // Verify category exists
        if (!categoryRepository.existsById(id)) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        
        List<Category> children = categoryRepository.findByParentId(id);
        return categoryMapper.toDtoList(children);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<BreadcrumbDto> getCategoryBreadcrumb(Long id) {
        log.info("Getting breadcrumb for category with ID: {}", id);
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        
        List<BreadcrumbDto> breadcrumbs = new ArrayList<>();
        buildBreadcrumb(category, breadcrumbs);
        
        return breadcrumbs;
    }
    
    private void buildBreadcrumb(Category category, List<BreadcrumbDto> breadcrumbs) {
        if (category == null) {
            return;
        }
        
        // Recursively build from parent first
        if (category.getParent() != null) {
            buildBreadcrumb(category.getParent(), breadcrumbs);
        }
        
        // Add current category to breadcrumb
        BreadcrumbDto breadcrumb = BreadcrumbDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .level(category.getLevel())
                .build();
        
        breadcrumbs.add(breadcrumb);
    }
}
