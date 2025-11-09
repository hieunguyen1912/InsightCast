package com.hieunguyen.podcastai.util;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Utility class to convert HTML article content to SSML format
 */
@Component
@Slf4j
public class ArticleToSsmlConverter {
    
    private static final int MAX_SSML_LENGTH = 5000; // Google TTS limit for SSML
    
    /**
     * Convert HTML article content to SSML
     * 
     * @param htmlContent HTML content from article
     * @param title Article title (will be emphasized)
     * @return SSML formatted string
     */
    public String convertToSsml(String htmlContent, String title) {
        try {
            Document doc = Jsoup.parse(htmlContent);
            StringBuilder ssml = new StringBuilder();
            
            // Start SSML
            ssml.append("<speak>");
            
            // Add title with emphasis
            if (title != null && !title.trim().isEmpty()) {
                ssml.append("<emphasis level=\"strong\">")
                    .append(escapeXml(title))
                    .append("</emphasis>")
                    .append("<break time=\"1s\"/>");
            }
            
            // Process content
            processElement(doc.body(), ssml);
            
            // End SSML
            ssml.append("</speak>");
            
            return ssml.toString();
            
        } catch (Exception e) {
            log.error("Failed to convert HTML to SSML: {}", e.getMessage(), e);
            // Fallback to plain text
            return "<speak>" + escapeXml(Jsoup.parse(htmlContent).text()) + "</speak>";
        }
    }
    
    /**
     * Process HTML elements and convert to SSML
     */
    private void processElement(Element element, StringBuilder ssml) {
        if (element == null) return;
        
        String tagName = element.tagName().toLowerCase();
        
        switch (tagName) {
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
            case "h6":
                ssml.append("<break time=\"0.5s\"/>");
                ssml.append("<emphasis level=\"moderate\">")
                    .append(escapeXml(element.text()))
                    .append("</emphasis>");
                ssml.append("<break time=\"0.8s\"/>");
                break;
                
            case "p":
                ssml.append(escapeXml(element.text()));
                ssml.append("<break time=\"0.5s\"/>");
                break;
                
            case "br":
                ssml.append("<break time=\"0.3s\"/>");
                break;
                
            case "strong":
            case "b":
                ssml.append("<emphasis level=\"moderate\">")
                    .append(escapeXml(element.text()))
                    .append("</emphasis>");
                break;
                
            case "em":
            case "i":
                ssml.append("<emphasis level=\"reduced\">")
                    .append(escapeXml(element.text()))
                    .append("</emphasis>");
                break;
                
            case "ul":
            case "ol":
                processList(element, ssml);
                break;
                
            case "li":
                ssml.append("• ").append(escapeXml(element.text()));
                ssml.append("<break time=\"0.3s\"/>");
                break;
                
            case "blockquote":
                ssml.append("<break time=\"0.5s\"/>");
                ssml.append("<prosody rate=\"slow\">")
                    .append(escapeXml(element.text()))
                    .append("</prosody>");
                ssml.append("<break time=\"0.5s\"/>");
                break;
                
            default:
                // For other elements, just get text
                if (element.children().isEmpty()) {
                    String text = element.text();
                    if (!text.trim().isEmpty()) {
                        ssml.append(escapeXml(text));
                    }
                } else {
                    // Process children
                    for (Element child : element.children()) {
                        processElement(child, ssml);
                    }
                }
                break;
        }
    }
    
    /**
     * Process list elements
     */
    private void processList(Element list, StringBuilder ssml) {
        Elements items = list.select("li");
        for (Element item : items) {
            ssml.append("• ").append(escapeXml(item.text()));
            ssml.append("<break time=\"0.3s\"/>");
        }
        ssml.append("<break time=\"0.5s\"/>");
    }
    
    /**
     * Escape XML special characters
     */
    private String escapeXml(String text) {
        if (text == null) return "";
        
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&apos;");
    }
    
    /**
     * Split SSML into chunks if it exceeds the limit
     * 
     * @param ssml Full SSML content
     * @return List of SSML chunks
     */
    public List<String> splitSsmlIntoChunks(String ssml) {
        List<String> chunks = new ArrayList<>();
        
        if (ssml.length() <= MAX_SSML_LENGTH) {
            chunks.add(ssml);
            return chunks;
        }
        
        // Remove outer <speak> tags temporarily
        String content = ssml.replaceFirst("^<speak>", "").replaceFirst("</speak>$", "");
        
        // Split by paragraphs or sentences
        String[] sentences = content.split("(?<=<break time=\"[0-9.]+s\"/>)");
        
        StringBuilder currentChunk = new StringBuilder("<speak>");
        
        for (String sentence : sentences) {
            if ((currentChunk.length() + sentence.length() + 9) > MAX_SSML_LENGTH) {
                // Close current chunk
                currentChunk.append("</speak>");
                chunks.add(currentChunk.toString());
                
                // Start new chunk
                currentChunk = new StringBuilder("<speak>");
            }
            currentChunk.append(sentence);
        }
        
        // Add last chunk
        if (currentChunk.length() > 7) { // More than just "<speak>"
            currentChunk.append("</speak>");
            chunks.add(currentChunk.toString());
        }
        
        return chunks;
    }
}

