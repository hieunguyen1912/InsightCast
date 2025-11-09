package com.hieunguyen.podcastai.enums;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(1003, "Email existed", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_CREDENTIALS(1009, "Invalid credentials, please try again.", HttpStatus.BAD_REQUEST),
    RESOURCE_NOT_FOUND(1012, "Resource not found", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND(1013, "User not found", HttpStatus.NOT_FOUND),
    USER_INACTIVE(1014, "User account is inactive", HttpStatus.FORBIDDEN),
    TOKEN_GENERATION_FAILED(1015, "Token generation failed", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_REFRESH_TOKEN(1016, "Invalid refresh token", HttpStatus.UNAUTHORIZED),
    TOKEN_REVOCATION_FAILED(1017, "Token revocation failed", HttpStatus.INTERNAL_SERVER_ERROR),
    USERNAME_ALREADY_EXISTS(1018, "Username already exists", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_EXISTS(1019, "Email already exists", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1020, "Invalid current password", HttpStatus.BAD_REQUEST),
    PASSWORD_MISMATCH(1021, "Password confirmation does not match", HttpStatus.BAD_REQUEST),
    
    // TTS Config Error Codes
    TTS_CONFIG_NOT_FOUND(2001, "TTS configuration not found", HttpStatus.NOT_FOUND),
    TTS_CONFIG_ACCESS_DENIED(2002, "Access denied to TTS configuration", HttpStatus.FORBIDDEN),
    TTS_CONFIG_NAME_EXISTS(2003, "TTS configuration name already exists", HttpStatus.BAD_REQUEST),
    TTS_CONFIG_NO_DEFAULT(2004, "No default TTS configuration found", HttpStatus.NOT_FOUND),
    
    // Category Error Codes
    CATEGORY_NOT_FOUND(4001, "Category not found", HttpStatus.NOT_FOUND),
    CATEGORY_NAME_EXISTS(4002, "Category name already exists", HttpStatus.BAD_REQUEST),
    CATEGORY_SLUG_NOT_FOUND(4005, "Category not found with slug", HttpStatus.NOT_FOUND),
    
    // Audio Error Codes
    AUDIO_FILE_PROCESSING_FAILED(5006, "Audio file processing failed", HttpStatus.INTERNAL_SERVER_ERROR),
    AUDIO_FILE_CANNOT_BE_DELETED(5007, "Cannot delete audio file while TTS operation is still running. Please wait for the operation to complete or fail", HttpStatus.BAD_REQUEST),


    //Search error code
    INVALID_SEARCH_INPUT(6001, "Invalid search input", HttpStatus.BAD_REQUEST),
    
    // Article Error Codes
    ARTICLE_NOT_FOUND(7001, "Article not found", HttpStatus.NOT_FOUND),
    ARTICLE_CANNOT_BE_UPDATED(7002, "Article can only be updated when in DRAFT or REJECTED status", HttpStatus.BAD_REQUEST),
    ARTICLE_CANNOT_BE_DELETED(7003, "Article can only be deleted when in DRAFT status", HttpStatus.BAD_REQUEST),
    ARTICLE_CANNOT_BE_SUBMITTED(7004, "Article can only be submitted when in DRAFT status", HttpStatus.BAD_REQUEST),
    ARTICLE_CANNOT_BE_APPROVED(7006, "Article can only be approved when in PENDING_REVIEW status", HttpStatus.BAD_REQUEST),
    ARTICLE_CANNOT_BE_REJECTED(7007, "Article can only be rejected when in PENDING_REVIEW status", HttpStatus.BAD_REQUEST),
    FORBIDDEN(7005, "You don't have permission to access this resource", HttpStatus.FORBIDDEN),
    
    // Image Error Codes
    IMAGE_NOT_FOUND(8001, "Image not found", HttpStatus.NOT_FOUND),
    IMAGE_UPLOAD_FAILED(8002, "Failed to upload image", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_FILE(8003, "Invalid file", HttpStatus.BAD_REQUEST),
    FILE_TOO_LARGE(8004, "File size exceeds maximum limit", HttpStatus.BAD_REQUEST),
    INVALID_FILE_TYPE(8005, "Invalid file type. Only images are allowed", HttpStatus.BAD_REQUEST),
    
    // RBAC Error Codes
    ROLE_NOT_FOUND(9001, "Role not found", HttpStatus.NOT_FOUND),
    ROLE_NAME_EXISTS(9002, "Role name or code already exists", HttpStatus.BAD_REQUEST),
    PERMISSION_NOT_FOUND(9003, "Permission not found", HttpStatus.NOT_FOUND),
    USER_ROLE_NOT_FOUND(9005, "User role assignment not found", HttpStatus.NOT_FOUND),
    ;

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
