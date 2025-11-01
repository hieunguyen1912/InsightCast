package com.hieunguyen.podcastai.entity;

import com.hieunguyen.podcastai.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

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

    @Column(nullable = false)
    private Boolean enabled;

    @Column(columnDefinition = "TEXT")
    private String keywords;

    @Column(columnDefinition = "TEXT")
    private String languages;

    @Column(columnDefinition = "TEXT")
    private String countries;

    @Column(nullable = false)
    private Integer maxResults = 20;

    @Column(nullable = false)
    private String sortBy = "publishedAt";

    @Column(nullable = false)
    private Integer dayRange = 7;
}
