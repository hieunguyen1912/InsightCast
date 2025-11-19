package com.hieunguyen.podcastai.repository;

import com.hieunguyen.podcastai.entity.FcmToken;
import com.hieunguyen.podcastai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FcmTokenRepository extends JpaRepository<FcmToken, Long> {
    Optional<FcmToken> findByUserAndToken(User user, String token);
    void deleteByUserAndToken(User user, String token);
    void deleteByToken(String token);
    void deleteAllByUser(User user);
    Optional<FcmToken> findByToken(String token);
    @Modifying
    @Query("SELECT ft.token FROM FcmToken ft WHERE ft.user = :user")
    List<String> findTokenByUser(@Param("user") User user);

    void deleteAllByTokenIn(List<String> tokens);
}
