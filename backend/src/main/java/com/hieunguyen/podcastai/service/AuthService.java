package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.dto.request.user.UserLoginRequest;
import com.hieunguyen.podcastai.dto.request.user.UserRegisterRequest;
import com.hieunguyen.podcastai.dto.response.TokenDto;
import com.hieunguyen.podcastai.dto.response.UserDto;
import com.hieunguyen.podcastai.dto.response.UserLoginResponse;
import com.hieunguyen.podcastai.entity.User;

public interface AuthService {
    UserDto register(UserRegisterRequest request);
    UserLoginResponse login(UserLoginRequest request);
    TokenDto generateAccessToken(User user);
    TokenDto generateTokens(User user);
    TokenDto refreshToken(String token);
    void revokeRefreshToken(String refreshToken);
    void revokeAllUserTokens(User user);
}
