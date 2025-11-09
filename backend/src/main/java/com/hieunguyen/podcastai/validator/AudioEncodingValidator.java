package com.hieunguyen.podcastai.validator;

import com.hieunguyen.podcastai.enums.AudioEncoding;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator for audio encoding values
 * Google Cloud TTS supports: MP3, WAV, LINEAR16, OGG_OPUS, MULAW, ALAW
 */
public class AudioEncodingValidator implements ConstraintValidator<ValidAudioEncoding, AudioEncoding> {

    @Override
    public void initialize(ValidAudioEncoding constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(AudioEncoding value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // Let @NotNull handle null validation if needed
        }
        // Check if the value is one of the valid enum values
        for (AudioEncoding encoding : AudioEncoding.values()) {
            if (encoding == value) {
                return true;
            }
        }
        return false;
    }
}

