package com.hieunguyen.podcastai.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private int status;
    private int code;
    private String message;
    private T data;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    private PageInfo pageInfo;

    
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .status(200)
                .code(1000)
                .message(message)
                .data(data)
                .build();
    }
    
    public static <T> ApiResponse<T> success(int status, String message, T data) {
        return ApiResponse.<T>builder()
                .status(status)
                .code(1000)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data, PageInfo pageInfo) {
        return ApiResponse.<T>builder()
                .status(200)
                .code(1000)
                .message(message)
                .data(data)
                .pageInfo(pageInfo)
                .build();
    }
    
    public static <T> ApiResponse<T> created(T data) {
        return ApiResponse.<T>builder()
                .status(201)
                .code(1000)
                .message("Created successfully")
                .data(data)
                .build();
    }
    
    public static <T> ApiResponse<T> created(String message, T data) {
        return ApiResponse.<T>builder()
                .status(201)
                .code(1000)
                .message(message)
                .data(data)
                .build();
    }
    
    public static <T> ApiResponse<T> noContent() {
        return ApiResponse.<T>builder()
                .status(204)
                .message("No content")
                .build();
    }
    
    public static <T> ApiResponse<T> badRequest(String message) {
        return ApiResponse.<T>builder()
                .status(400)
                .message(message)
                .build();
    }
    
    public static <T> ApiResponse<T> unauthorized(String message) {
        return ApiResponse.<T>builder()
                .status(401)
                .message(message)
                .build();
    }
    
    public static <T> ApiResponse<T> forbidden(String message) {
        return ApiResponse.<T>builder()
                .status(403)
                .message(message)
                .build();
    }
    
    public static <T> ApiResponse<T> notFound(String message) {
        return ApiResponse.<T>builder()
                .status(404)
                .message(message)
                .build();
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .status(500)
                .message(message)
                .build();
    }
    
    public static <T> ApiResponse<T> error(int status, String message, int code) {
        return ApiResponse.<T>builder()
                .status(status)
                .code(code)
                .message(message)
                .build();
    }

    @Data
    public static class PageInfo {
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
        
        public static PageInfo from(Page<?> page) {
            PageInfo info = new PageInfo();
            info.page = page.getNumber();
            info.size = page.getSize();
            info.totalElements = page.getTotalElements();
            info.totalPages = page.getTotalPages();
            info.hasNext = page.hasNext();
            info.hasPrevious = page.hasPrevious();
            return info;
        }
    }
}
