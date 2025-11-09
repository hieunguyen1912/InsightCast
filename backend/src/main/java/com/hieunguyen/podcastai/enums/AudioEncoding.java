package com.hieunguyen.podcastai.enums;

import lombok.Getter;

/**
 * Audio encoding formats supported by Google Cloud Text-to-Speech
 */
@Getter
public enum AudioEncoding {
    MP3("MP3", "audio/mpeg"),
    WAV("WAV", "audio/wav"),
    LINEAR16("LINEAR16", "audio/pcm"),
    OGG_OPUS("OGG_OPUS", "audio/ogg"),
    MULAW("MULAW", "audio/basic"),
    ALAW("ALAW", "audio/basic");

    private final String value;
    private final String mimeType;

    AudioEncoding(String value, String mimeType) {
        this.value = value;
        this.mimeType = mimeType;
    }

    /**
     * Convert to Google Cloud TTS AudioEncoding enum value
     */
    public com.google.cloud.texttospeech.v1.AudioEncoding toGoogleAudioEncoding() {
        return com.google.cloud.texttospeech.v1.AudioEncoding.valueOf(this.value);
    }

    /**
     * Get file extension for this encoding
     */
    public String getFileExtension() {
        return switch (this) {
            case MP3 -> "mp3";
            case WAV -> "wav";
            case LINEAR16 -> "wav";
            case OGG_OPUS -> "ogg";
            case MULAW -> "ulaw";
            case ALAW -> "alaw";
        };
    }
}

