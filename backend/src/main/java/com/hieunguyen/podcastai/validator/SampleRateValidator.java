package com.hieunguyen.podcastai.validator;

import com.hieunguyen.podcastai.enums.SampleRate;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator for sample rate values
 * Google Cloud TTS supports: 8000, 16000, 22050, 24000, 44100, 48000 Hz
 */
public class SampleRateValidator implements ConstraintValidator<ValidSampleRate, SampleRate> {

    @Override
    public void initialize(ValidSampleRate constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(SampleRate value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // Let @NotNull handle null validation if needed
        }
        // Check if the value is one of the valid enum values
        for (SampleRate rate : SampleRate.values()) {
            if (rate == value) {
                return true;
            }
        }
        return false;
    }
}

