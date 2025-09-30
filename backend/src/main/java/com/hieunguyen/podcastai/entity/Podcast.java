package com.hieunguyen.podcastai.entity;

import com.hieunguyen.podcastai.entity.base.AuditableEntity;
import com.hieunguyen.podcastai.enums.PodcastStatus;
import com.hieunguyen.podcastai.enums.Visibility;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "podcasts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Podcast extends AuditableEntity {
    
    @Column(name = "title", nullable = false, length = 200)
    private String title;
    
    @Column(name = "description", length = 2000)
    private String description;
    
    @Column(name = "cover_image_url")
    private String coverImageUrl;
    
    @Column(name = "language", length = 10)
    private String language;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PodcastStatus status = PodcastStatus.DRAFT;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false)
    private Visibility visibility = Visibility.PRIVATE;
    
    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;
    
    @Column(name = "total_episodes")
    private Integer totalEpisodes = 0;
    
    @Column(name = "total_duration_seconds")
    private Long totalDurationSeconds = 0L;
    
    @Column(name = "total_plays")
    private Long totalPlays = 0L;
    
    @Column(name = "total_likes")
    private Long totalLikes = 0L;
    
    @Column(name = "total_shares")
    private Long totalShares = 0L;
    
    @Column(name = "public_url")
    private String publicUrl;
    
    @Column(name = "rss_feed_url")
    private String rssFeedUrl;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @OneToMany(mappedBy = "podcast", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Episode> episodes = new ArrayList<>();
    
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "podcast_categories",
        joinColumns = @JoinColumn(name = "podcast_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> categories = new ArrayList<>();
    
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "podcast_tags",
        joinColumns = @JoinColumn(name = "podcast_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private List<Tag> tags = new ArrayList<>();
    
}