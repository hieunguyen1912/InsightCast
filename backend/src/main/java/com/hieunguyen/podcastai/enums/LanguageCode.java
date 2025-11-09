package com.hieunguyen.podcastai.enums;

import lombok.Getter;

/**
 * Language codes supported by Google Cloud Text-to-Speech
 */
@Getter
public enum LanguageCode {
    ENGLISH_US("en-US", "English (United States)"),
    ENGLISH_GB("en-GB", "English (United Kingdom)"),
    VIETNAMESE("vi-VN", "Tiếng Việt"),
    SPANISH("es-ES", "Español (España)"),
    SPANISH_MX("es-MX", "Español (México)"),
    FRENCH("fr-FR", "Français"),
    GERMAN("de-DE", "Deutsch"),
    ITALIAN("it-IT", "Italiano"),
    PORTUGUESE_BR("pt-BR", "Português (Brasil)"),
    PORTUGUESE_PT("pt-PT", "Português (Portugal)"),
    JAPANESE("ja-JP", "日本語"),
    KOREAN("ko-KR", "한국어"),
    CHINESE_CN("zh-CN", "中文 (简体)"),
    CHINESE_TW("zh-TW", "中文 (繁體)"),
    RUSSIAN("ru-RU", "Русский"),
    ARABIC("ar-XA", "العربية"),
    HINDI("hi-IN", "हिन्दी"),
    THAI("th-TH", "ไทย"),
    INDONESIAN("id-ID", "Bahasa Indonesia");

    private final String code;
    private final String displayName;

    LanguageCode(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    /**
     * Get LanguageCode from code string
     */
    public static LanguageCode fromCode(String code) {
        for (LanguageCode lang : values()) {
            if (lang.code.equals(code)) {
                return lang;
            }
        }
        return null;
    }

    /**
     * Check if code is valid
     */
    public static boolean isValid(String code) {
        return fromCode(code) != null;
    }
}

