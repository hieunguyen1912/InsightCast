package com.hieunguyen.podcastai.repository;

import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.entity.UserNewsPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserNewsPreferencesRepository extends JpaRepository<UserNewsPreferences, Long> {
    
    Optional<UserNewsPreferences> findByUser(User user);
}

