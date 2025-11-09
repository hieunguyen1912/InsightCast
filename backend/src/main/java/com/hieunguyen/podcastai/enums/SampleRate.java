package com.hieunguyen.podcastai.enums;

import lombok.Getter;

import java.util.List;

@Getter
public enum SampleRate {
    RATE_8000(8000),
    RATE_16000(16000),
    RATE_22050(22050),
    RATE_24000(24000),
    RATE_44100(44100),
    RATE_48000(48000);

    private final int hertz;

    SampleRate(int hertz) {
        this.hertz = hertz;
    }

    public static SampleRate fromHertz(int hertz) {
        for (SampleRate rate : values()) {
            if (rate.hertz == hertz) {
                return rate;
            }
        }
        return null;
    }

    public static boolean isValid(int hertz) {
        return fromHertz(hertz) != null;
    }

    public static final List<Integer> VALID_SAMPLE_RATES = List.of(
            RATE_8000.hertz, RATE_16000.hertz, RATE_22050.hertz, 
            RATE_24000.hertz, RATE_44100.hertz, RATE_48000.hertz
    );

    public static final SampleRate DEFAULT = RATE_24000;
}

