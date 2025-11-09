package com.hieunguyen.podcastai.enums;

import lombok.Getter;

/**
 * Sample rates supported by Google Cloud Text-to-Speech
 */
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

    /**
     * Get SampleRate from hertz value
     */
    public static SampleRate fromHertz(int hertz) {
        for (SampleRate rate : values()) {
            if (rate.hertz == hertz) {
                return rate;
            }
        }
        return null;
    }

    /**
     * Check if hertz value is valid
     */
    public static boolean isValid(int hertz) {
        return fromHertz(hertz) != null;
    }
}

