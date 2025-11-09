package com.hieunguyen.podcastai.service.impl;

import com.hieunguyen.podcastai.entity.Role;
import com.hieunguyen.podcastai.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.hieunguyen.podcastai.config.SecurityConfig;
import com.hieunguyen.podcastai.dto.request.user.UserLoginRequest;
import com.hieunguyen.podcastai.dto.request.user.UserRegisterRequest;
import com.hieunguyen.podcastai.dto.response.TokenDto;
import com.hieunguyen.podcastai.dto.response.UserDto;
import com.hieunguyen.podcastai.dto.response.UserLoginResponse;
import com.hieunguyen.podcastai.entity.RefreshToken;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.enums.UserStatus;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.mapper.UserMapper;
import com.hieunguyen.podcastai.repository.RefreshTokenRepository;
import com.hieunguyen.podcastai.repository.UserRepository;
import com.hieunguyen.podcastai.service.AuthService;
import com.hieunguyen.podcastai.service.UserRoleService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    @Value("${app.jwt.access-token.expiration-ms}")
    private Long accessTokenExpirationMs;
    
    @Value("${app.jwt.refresh-token.expiration-ms}")
    private Long refreshTokenExpirationMs;

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final JwtEncoder jwtEncoder;
    private final UserRoleService userRoleService;

    @Override
    public UserDto register(UserRegisterRequest request) {
        log.info("Starting user registration for email: {}", request.getEmail());
        
        try {
            // Check if user already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                log.warn("Registration failed: Email already exists - {}", request.getEmail());
                throw new AppException(ErrorCode.EMAIL_EXISTED);
            }
            
            if (userRepository.existsByUsername(request.getUsername())) {
                log.warn("Registration failed: Username already exists - {}", request.getUsername());
                throw new AppException(ErrorCode.USER_EXISTED);
            }
            
            // Map request to entity
            User user = userMapper.toEntity(request);
            
            // Set additional fields
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setStatus(UserStatus.ACTIVE);
            user.setEmailVerified(false);
            user.setPhoneNumber(request.getPhoneNumber());
            Role role = roleRepository.findByCode("USER").orElseThrow(
                    () -> new AppException(ErrorCode.ROLE_NOT_FOUND)
            );
            user.setRoles(Set.of(role));
            User savedUser = userRepository.save(user);

            return userMapper.toDto(savedUser);
            
        } catch (AppException e) {
            log.error("Registration failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during registration for email: {}", request.getEmail(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    public UserLoginResponse login(UserLoginRequest request) {
        log.info("Starting user login for email: {}", request.getEmail());

        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
            request.getEmail(),
            request.getPassword()
        );

        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        log.info("Authentication successful for email: {}", authentication.getName());
        
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Generate JWT tokens (access + refresh)
        TokenDto tokens = generateTokens(user);

        UserDto userDto = userMapper.toDto(user);

        // Create response
        UserLoginResponse response = UserLoginResponse.builder()
                .user(userDto)
                .tokens(tokens)
                .requiresEmailVerification(!user.getEmailVerified())
                .build();
        
        log.info("User login successful for ID: {}", user.getId());
        return response;
    }

    @Override
    public TokenDto generateAccessToken(User user) {
        log.info("Generating access token for user ID: {}", user.getId());
        
        try {
            Instant now = Instant.now();
            Instant expiresAt = now.plus(accessTokenExpirationMs, ChronoUnit.MILLIS);
            

            List<String> roleCodes = user.getRoles() != null 
                    ? user.getRoles().stream()
                            .map(Role::getCode)
                            .collect(Collectors.toList())
                    : List.of();
            
            JwtClaimsSet claims = JwtClaimsSet.builder()
                    .issuer("podcastai-backend")
                    .issuedAt(now)
                    .expiresAt(expiresAt)
                    .subject(user.getId().toString())
                    .claim("username", user.getUsername())
                    .claim("email", user.getEmail())
                    .build();

            JwsHeader jwsHeader = JwsHeader.with(SecurityConfig.JWT_ALGORITHM).build();
            
            String accessToken = jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
            
            TokenDto tokenDto = TokenDto.builder()
                    .accessToken(accessToken)
                    .tokenType("Bearer")
                    .expiresIn(accessTokenExpirationMs)
                    .expiresAt(expiresAt)
                    .build();
            
            log.info("Access token generated successfully for user ID: {}", user.getId());
            return tokenDto;
                
        } catch (Exception e) {
            log.error("Failed to generate access token for user ID: {}", user.getId(), e);
            throw new AppException(ErrorCode.TOKEN_GENERATION_FAILED);
        }
    }

    @Override
    public TokenDto generateTokens(User user) {
        log.info("Generating tokens for user ID: {}", user.getId());
        
        try {
            // Generate access token
            TokenDto accessTokenDto = generateAccessToken(user);
            
            // Generate refresh token
            String refreshTokenValue = generateRefreshToken(user);
            
            // Update TokenDto with refresh token
            accessTokenDto.setRefreshToken(refreshTokenValue);
            
            log.info("Tokens generated successfully for user ID: {}", user.getId());
            return accessTokenDto;
            
        } catch (Exception e) {
            log.error("Failed to generate tokens for user ID: {}", user.getId(), e);
            throw new AppException(ErrorCode.TOKEN_GENERATION_FAILED);
        }
    }

    @Override
    public TokenDto refreshToken(String token) {
        log.info("Refreshing token for refresh token: {}", token);
        
        try {
            RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_REFRESH_TOKEN));
            
            if (!refreshToken.isValid()) {
                log.warn("Invalid refresh token: expired or revoked");
                throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
            }

            User user = refreshToken.getUser();
            
            if (user.getStatus() != UserStatus.ACTIVE) {
                log.warn("User account is not active for refresh token");
                throw new AppException(ErrorCode.USER_INACTIVE);
            }
            
            refreshToken.setIsRevoked(true);
            refreshTokenRepository.save(refreshToken);
            
            TokenDto newTokens = generateTokens(user);
            
            log.info("Token refreshed successfully for user ID: {}", user.getId());
            return newTokens;
            
        } catch (AppException e) {
            log.error("Token refresh failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during token refresh", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    public void revokeRefreshToken(String refreshToken) {
        log.info("Revoking refresh token");
        
        try {
            refreshTokenRepository.revokeToken(refreshToken);
            log.info("Refresh token revoked successfully");
        } catch (Exception e) {
            log.error("Failed to revoke refresh token", e);
            throw new AppException(ErrorCode.TOKEN_REVOCATION_FAILED);
        }
    }

    @Override
    public void revokeAllUserTokens(User user) {
        log.info("Revoking all tokens for user ID: {}", user.getId());
        
        try {
            refreshTokenRepository.revokeAllUserTokens(user);
            log.info("All tokens revoked successfully for user ID: {}", user.getId());
        } catch (Exception e) {
            log.error("Failed to revoke all tokens for user ID: {}", user.getId(), e);
            throw new AppException(ErrorCode.TOKEN_REVOCATION_FAILED);
        }
    }

    private String generateRefreshToken(User user) {
        log.info("Generating refresh token for user ID: {}", user.getId());
        
        try {
            String refreshTokenValue = UUID.randomUUID().toString();
            
            // Calculate expiration
            Instant now = Instant.now();
            Instant expiresAt = now.plus(refreshTokenExpirationMs, ChronoUnit.MILLIS);
            
            // Create refresh token entity
            RefreshToken refreshToken = RefreshToken.builder()
                    .token(refreshTokenValue)
                    .user(user)
                    .expiresAt(expiresAt)
                    .isRevoked(false)
                    .build();
            
            // Save refresh token
            refreshTokenRepository.save(refreshToken);
            
            log.info("Refresh token generated successfully for user ID: {}", user.getId());
            return refreshTokenValue;
            
        } catch (Exception e) {
            log.error("Failed to generate refresh token for user ID: {}", user.getId(), e);
            throw new AppException(ErrorCode.TOKEN_GENERATION_FAILED);
        }
    }
}
