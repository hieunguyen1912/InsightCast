package com.hieunguyen.podcastai.entity;

import com.hieunguyen.podcastai.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fcm_tokens",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "token"})
        },
        indexes = {
                @Index(name = "idx_fcm_tokens_user_id", columnList = "user_id"),
                @Index(name = "idx_fcm_tokens_token", columnList = "token")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FcmToken extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token", nullable = false, length = 500)
    private String token;

    @Column(name = "device_type", length = 50)
    private String deviceType;

    @Column(name = "device_info", columnDefinition = "TEXT")
    private String deviceInfo;
}