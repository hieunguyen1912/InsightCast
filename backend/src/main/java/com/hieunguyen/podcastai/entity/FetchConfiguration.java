package com.hieunguyen.podcastai.entity;

import com.hieunguyen.podcastai.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "fetch_configurations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FetchConfiguration extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "news_source_id", nullable = false)
    private NewsSource newsSource;

    private com.hieunguyen.podcastai.enums.FetchType fetchType;

    @Column(nullable = false)
    private Boolean enabled;

    @Column(columnDefinition = "TEXT")
    private String keywords;

    @Column(columnDefinition = "TEXT")
    private String languages;

    @Column(columnDefinition = "TEXT")
    private String countries;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private Integer maxResults = 20;

    @Column(nullable = false)
    private String sortBy = "publishedAt";

    @Column(name = "from_date")
    private Instant from;

    @Column(name = "to_date")
    private Instant to;
}
