package com.hieunguyen.podcastai.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

/**
 * Filter to remove Authorization header for refresh token endpoint
 * to prevent JWT filter from processing expired tokens
 */
@Component
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RefreshTokenRequestFilter extends OncePerRequestFilter {

    private static final String REFRESH_TOKEN_ENDPOINT = "/api/v1/auth/refresh";

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) 
            throws ServletException, IOException {
        
        String requestUri = request.getRequestURI();
        
        // Remove Authorization header for refresh endpoint to prevent JWT validation
        if (requestUri != null && requestUri.equals(REFRESH_TOKEN_ENDPOINT)) {
            HttpServletRequest wrappedRequest = new HttpServletRequestWrapper(request) {
                @Override
                public String getHeader(String name) {
                    if ("Authorization".equalsIgnoreCase(name)) {
                        return null; // Remove Authorization header
                    }
                    return super.getHeader(name);
                }

                @Override
                public Enumeration<String> getHeaders(String name) {
                    if ("Authorization".equalsIgnoreCase(name)) {
                        return Collections.enumeration(Collections.emptyList());
                    }
                    return super.getHeaders(name);
                }

                @Override
                public Enumeration<String> getHeaderNames() {
                    List<String> headerNames = Collections.list(super.getHeaderNames());
                    headerNames.removeIf("Authorization"::equalsIgnoreCase);
                    return Collections.enumeration(headerNames);
                }
            };
            
            filterChain.doFilter(wrappedRequest, response);
        } else {
            filterChain.doFilter(request, response);
        }
    }
}

