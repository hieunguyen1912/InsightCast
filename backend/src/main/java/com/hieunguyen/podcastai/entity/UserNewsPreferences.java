package com.hieunguyen.podcastai.entity;

import com.hieunguyen.podcastai.entity.base.BaseEntity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_news_preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UserNewsPreferences extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToMany
    @JoinTable(
        name = "user_preferred_categories",
        joinColumns = @JoinColumn(name = "user_news_preferences_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    private List<Category> preferredCategories = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_preferred_sources", joinColumns = @JoinColumn(name = "user_news_preferences_id"))
    @Column(name = "source_name")
    private List<String> preferredSources;

    @ElementCollection
    @CollectionTable(name = "user_preferred_languages", joinColumns = @JoinColumn(name = "user_news_preferences_id"))
    @Column(name = "language_code")
    private List<String> preferredLanguages;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_tts_config_id")
    private TtsConfig defaultTtsConfig;

    @Column(name = "notification_enabled", nullable = false)
    @Builder.Default
    private Boolean notificationEnabled = true;

    @Column(name = "email_notifications", nullable = false)
    @Builder.Default
    private Boolean emailNotifications = false;

    @Column(name = "push_notifications", nullable = false)
    @Builder.Default
    private Boolean pushNotifications = true;
}
