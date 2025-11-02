package com.hieunguyen.podcastai.enums;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(1003, "Email existed", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS(1009, "Invalid credentials, please try again.", HttpStatus.BAD_REQUEST),
    VALIDATION_FAILED(1011, "Validation failed", HttpStatus.BAD_REQUEST),
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
    TTS_CONFIG_INVALID_PARAMETERS(2005, "Invalid TTS configuration parameters", HttpStatus.BAD_REQUEST),
    
    // Tag Error Codes
    TAG_NOT_FOUND(3001, "Tag not found", HttpStatus.NOT_FOUND),
    TAG_NAME_EXISTS(3002, "Tag name already exists", HttpStatus.BAD_REQUEST),
    TAG_NAME_NOT_FOUND(3003, "Tag not found with name", HttpStatus.NOT_FOUND),
    TAG_INVALID_USAGE_COUNT(3004, "Invalid usage count operation", HttpStatus.BAD_REQUEST),
    TAG_TRENDING_STATUS_UPDATE_FAILED(3005, "Failed to update trending status", HttpStatus.BAD_REQUEST),
    
    // Category Error Codes
    CATEGORY_NOT_FOUND(4001, "Category not found", HttpStatus.NOT_FOUND),
    CATEGORY_NAME_EXISTS(4002, "Category name already exists", HttpStatus.BAD_REQUEST),
    CATEGORY_SLUG_EXISTS(4003, "Category slug already exists", HttpStatus.BAD_REQUEST),
    CATEGORY_NAME_NOT_FOUND(4004, "Category not found with name", HttpStatus.NOT_FOUND),
    CATEGORY_SLUG_NOT_FOUND(4005, "Category not found with slug", HttpStatus.NOT_FOUND),
    CATEGORY_PARENT_NOT_FOUND(4006, "Parent category not found", HttpStatus.NOT_FOUND),
    CATEGORY_HAS_SUBCATEGORIES(4007, "Cannot delete category with subcategories", HttpStatus.BAD_REQUEST),
    CATEGORY_HIERARCHY_UPDATE_FAILED(4008, "Failed to update category hierarchy", HttpStatus.BAD_REQUEST),
    CATEGORY_REORDER_FAILED(4009, "Failed to reorder categories", HttpStatus.BAD_REQUEST),
    CATEGORY_MOVE_FAILED(4010, "Failed to move category", HttpStatus.BAD_REQUEST),
    CATEGORY_SELF_REFERENCE(4011, "Cannot set category as its own parent", HttpStatus.BAD_REQUEST),
    CATEGORY_CIRCULAR_REFERENCE(4012, "Cannot create circular parent-child relationship", HttpStatus.BAD_REQUEST),
    
    // Audio Error Codes
    AUDIO_GENERATION_FAILED(5001, "Audio generation failed", HttpStatus.INTERNAL_SERVER_ERROR),
    TTS_SYNTHESIS_FAILED(5002, "Text-to-speech synthesis failed", HttpStatus.INTERNAL_SERVER_ERROR),
    AUDIO_FILE_NOT_FOUND(5003, "Audio file not found", HttpStatus.NOT_FOUND),
    AUDIO_FILE_ACCESS_DENIED(5004, "Access denied to audio file", HttpStatus.FORBIDDEN),
    AUDIO_FILE_STORAGE_FAILED(5005, "Failed to store audio file", HttpStatus.INTERNAL_SERVER_ERROR),
    AUDIO_FILE_PROCESSING_FAILED(5006, "Audio file processing failed", HttpStatus.INTERNAL_SERVER_ERROR),


    //Search error code
    INVALID_SEARCH_INPUT(6001, "Invalid search input", HttpStatus.BAD_REQUEST),
    
    // Article Error Codes
    ARTICLE_NOT_FOUND(7001, "Article not found", HttpStatus.NOT_FOUND),
    ARTICLE_CANNOT_BE_UPDATED(7002, "Article can only be updated when in DRAFT or REJECTED status", HttpStatus.BAD_REQUEST),
    ARTICLE_CANNOT_BE_DELETED(7003, "Article can only be deleted when in DRAFT status", HttpStatus.BAD_REQUEST),
    ARTICLE_CANNOT_BE_SUBMITTED(7004, "Article can only be submitted when in DRAFT status", HttpStatus.BAD_REQUEST),
    FORBIDDEN(7005, "You don't have permission to access this resource", HttpStatus.FORBIDDEN),
    
    // Image Error Codes
    IMAGE_NOT_FOUND(8001, "Image not found", HttpStatus.NOT_FOUND),
    IMAGE_UPLOAD_FAILED(8002, "Failed to upload image", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_FILE(8003, "Invalid file", HttpStatus.BAD_REQUEST),
    FILE_TOO_LARGE(8004, "File size exceeds maximum limit", HttpStatus.BAD_REQUEST),
    INVALID_FILE_TYPE(8005, "Invalid file type. Only images are allowed", HttpStatus.BAD_REQUEST),
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
