package com.hieunguyen.podcastai.service;

import com.hieunguyen.podcastai.entity.FcmToken;
import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.enums.ErrorCode;
import com.hieunguyen.podcastai.exception.AppException;
import com.hieunguyen.podcastai.repository.FcmTokenRepository;
import com.hieunguyen.podcastai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FcmTokenServiceImpl implements FcmTokenService {

    private final FcmTokenRepository fcmTokenRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void saveToken(Long userId, String token, String deviceType, String deviceInfo) {

        User user = userRepository.findById(userId).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND));

        Optional<FcmToken> existingToken = fcmTokenRepository.findByUserAndToken(user, token);

        FcmToken fcmToken = null;
        if (existingToken.isPresent()) {
            fcmToken = existingToken.get();
            fcmToken.setDeviceInfo(deviceInfo);
            fcmToken.setUser(user);
            fcmToken.setDeviceType(deviceType);
        } else {
            fcmToken = FcmToken.builder()
                    .token(token)
                    .deviceInfo(deviceInfo)
                    .deviceType(deviceType)
                    .user(user)
                    .build();
        }
        fcmTokenRepository.save(fcmToken);

    }

    @Override
    @Transactional
    public void removeToken(Long userId, String token) {
        log.info("Removed FCM token for user: {}", userId);

        User user = userRepository.findById(userId).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND));

        fcmTokenRepository.deleteByUserAndToken(user, token);
        log.info("Removed FCM token for user: {}", userId);

    }

    @Override
    @Transactional
    public void removeTokensByTokens(List<String> tokens) {
        if (tokens == null || tokens.isEmpty()) {
            return;
        }

        fcmTokenRepository.deleteAllByTokenIn(tokens);
    }

    @Override
    @Transactional
    public void removeTokenByToken(String token) {
        log.info("Removing FCM token: {}", token);
        fcmTokenRepository.deleteByToken(token);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getUserTokens(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND));

        return fcmTokenRepository.findTokenByUser(user);
    }

    @Override
    @Transactional
    public void removeAllUserTokens(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND));

        fcmTokenRepository.deleteAllByUser(user);
        log.info("Removed all user tokens");
    }

    @Override
    @Transactional(readOnly = true)
    public boolean tokenExists(String token) {
        return fcmTokenRepository.findByToken(token).isPresent();
    }
}
