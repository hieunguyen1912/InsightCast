package com.hieunguyen.podcastai.config;


import java.io.IOException;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.web.AuthenticationEntryPoint;

import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.enums.ErrorCode;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;
    
    @Override
    public void commence(HttpServletRequest request, 
                        HttpServletResponse response, 
                        AuthenticationException authException) throws IOException {
        
        log.warn("Authentication failed for request: {} - {}", 
                request.getRequestURI(), authException.getMessage());
        
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        ApiResponse<Object> apiResponse = ApiResponse.error(
            ErrorCode.UNAUTHORIZED.getStatusCode().value(),
            buildClientMessage(authException), 
            ErrorCode.UNAUTHORIZED.getCode()
        );
        
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }

    private String buildClientMessage(AuthenticationException ex) {
        if (ex.getClass().getSimpleName().contains("Jwt")) {
            return "Invalid or expired JWT token";
        }
        if (ex instanceof BadCredentialsException) {
            return "Invalid username or password";
        }
        return "Unauthorized";
    }
}