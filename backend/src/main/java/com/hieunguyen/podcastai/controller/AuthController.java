package com.hieunguyen.podcastai.controller;

import com.hieunguyen.podcastai.dto.request.user.UserLoginRequest;
import com.hieunguyen.podcastai.dto.request.user.UserRegisterRequest;
import com.hieunguyen.podcastai.dto.response.ApiResponse;
import com.hieunguyen.podcastai.dto.response.TokenDto;
import com.hieunguyen.podcastai.dto.response.UserLoginResponse;
import com.hieunguyen.podcastai.dto.response.UserRegisterResponse;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.service.AuthService;
import com.hieunguyen.podcastai.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Slf4j
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SecurityUtils securityUtils;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserLoginResponse>> login(@Valid @RequestBody UserLoginRequest request) {
        log.info("Login endpoint called");
        UserLoginResponse response = authService.login(request);

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", response.getTokens().getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(Duration.ofDays(7))
                .sameSite("Strict")
                .build();
                
        response.getTokens().setRefreshToken(null);
        
        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
            .body(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserRegisterResponse>> register(@Valid @RequestBody UserRegisterRequest request) {
        
        log.info("User registration request received for email: {}", request.getEmail());
        UserRegisterResponse response = authService.register(request);  
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenDto>> refreshToken(@CookieValue("refreshToken") String token) {
        log.info("Refresh token request received: {}", token);
        TokenDto response = authService.refreshToken(token);

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", response.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(Duration.ofDays(7))
                .sameSite("Strict")
                .build();
                
        response.setRefreshToken(null);
        
        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
            .body(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/revoke")
    public ResponseEntity<ApiResponse<String>> revokeToken(@CookieValue("refreshToken") String token) {
        log.info("Revoke token request received: {}", token);
        authService.revokeRefreshToken(token);

        ResponseCookie deleteRefreshTokenCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)  // hết hạn ngay lập tức
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, deleteRefreshTokenCookie.toString())
            .body(ApiResponse.success("Token revoked successfully", null));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        log.info("Logout request received");
        
        try {
            // Get current authenticated user
            User currentUser = securityUtils.getCurrentUser();
            log.info("Logging out user: {}", currentUser.getEmail());
            
            // Revoke all user tokens
            authService.revokeAllUserTokens(currentUser);
        } catch (Exception e) {
            log.warn("User not authenticated during logout, proceeding with cookie cleanup: {}", e.getMessage());
        }

        // Clear refresh token cookie regardless of authentication status
        ResponseCookie deleteRefreshTokenCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, deleteRefreshTokenCookie.toString())
            .body(ApiResponse.success("Logout successful", null));
    }
}
