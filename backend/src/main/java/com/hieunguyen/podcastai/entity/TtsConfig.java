package com.hieunguyen.podcastai.entity;

import java.util.ArrayList;
import java.util.List;

import com.hieunguyen.podcastai.entity.base.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tts_configs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TtsConfig extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "language_code", nullable = false, length = 10)
    private String languageCode; // "en-US", "vi-VN"

    @Column(name = "voice_name", nullable = false, length = 50)
    private String voiceName; // "en-US-Standard-A"

    @Column(name = "speaking_rate", nullable = false)
    private Double speakingRate;

    @Column(name = "pitch", nullable = false)
    private Double pitch;

    @Column(name = "volume_gain_db", nullable = false)
    private Double volumeGain;

    @Column(name = "audio_encoding", nullable = false, length = 20)
    private String audioEncoding;

    @Column(name = "sample_rate_hertz")
    private Integer sampleRateHertz; // 8000, 16000, 22050, 44100

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "ttsConfig", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AudioFile> audioFiles = new ArrayList<>();
}