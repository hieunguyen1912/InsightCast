package com.hieunguyen.podcastai.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.enums.ErrorCode;

@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<?>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        ApiResponse<?> response = ApiResponse.error(errorCode.getStatusCode().value(), errorCode.getMessage(), errorCode.getCode());
        return ResponseEntity.status(errorCode.getStatusCode()).body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<?>> handleBadCredentialsException(BadCredentialsException ex) {
        ErrorCode errorCode = ErrorCode.INVALID_CREDENTIALS;
        ApiResponse<?> response = ApiResponse.error(
            errorCode.getStatusCode().value(), 
            errorCode.getMessage(), 
            errorCode.getCode()
        );
        return ResponseEntity.status(errorCode.getStatusCode()).body(response);
    }
}
