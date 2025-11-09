package com.hieunguyen.podcastai.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validates that the audio encoding is one of the supported values by Google Cloud TTS
 */
@Documented
@Constraint(validatedBy = AudioEncodingValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidAudioEncoding {
    String message() default "Audio encoding must be one of: MP3, WAV, LINEAR16, OGG_OPUS, MULAW, ALAW";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

