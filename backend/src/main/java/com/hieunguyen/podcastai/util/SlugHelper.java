package com.hieunguyen.podcastai.util;

public class SlugHelper {

    public static String generateSlug(String title) {
        if (title == null || title.trim().isEmpty()) {
            return "";
        }
        
        String slug = title.toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", ""); // Remove leading and trailing hyphens
        
        return slug;
    }

}
