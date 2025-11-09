package com.hieunguyen.podcastai.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Set;

/**
 * Validator for sample rate values
 * Google Cloud TTS supports: 8000, 16000, 22050, 24000, 44100, 48000 Hz
 */
public class SampleRateValidator implements ConstraintValidator<ValidSampleRate, Integer> {

    private static final Set<Integer> VALID_SAMPLE_RATES = Set.of(8000, 16000, 22050, 24000, 44100, 48000);

    @Override
    public void initialize(ValidSampleRate constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(Integer value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // Let @NotNull handle null validation
        }
        return VALID_SAMPLE_RATES.contains(value);
    }
}

