package com.hieunguyen.podcastai.repository;

import com.hieunguyen.podcastai.entity.TtsConfig;
import com.hieunguyen.podcastai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TtsConfigRepository extends JpaRepository<TtsConfig, Long> {

    boolean existsByUserAndName(User user, String name);
    Optional<TtsConfig> findByUser(User user);
}
