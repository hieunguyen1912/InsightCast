package com.hieunguyen.podcastai.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validates that the sample rate is one of the supported values by Google Cloud TTS
 * Supported values: 8000, 16000, 22050, 24000, 44100, 48000 Hz
 */
@Documented
@Constraint(validatedBy = SampleRateValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidSampleRate {
    String message() default "Sample rate must be one of: 8000, 16000, 22050, 24000, 44100, 48000 Hz";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

