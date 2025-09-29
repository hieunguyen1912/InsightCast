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
    PASSWORD_EXISTED(1010, "Password existed", HttpStatus.BAD_REQUEST),
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
