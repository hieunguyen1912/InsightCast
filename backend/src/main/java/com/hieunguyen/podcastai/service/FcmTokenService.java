package com.hieunguyen.podcastai.service;

import java.util.List;

public interface FcmTokenService {

    void saveToken(Long userId, String token, String deviceType, String deviceInfo);

    void removeToken(Long userId, String token);

    void removeTokensByTokens(List<String> tokens);

    void removeTokenByToken(String token);

    List<String> getUserTokens(Long userId);

    void removeAllUserTokens(Long userId);

    boolean tokenExists(String token);
}
