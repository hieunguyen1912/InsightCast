package com.hieunguyen.podcastai.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ImageResponseDto {
    
    private Long id;
    private String url;
    private String fileName;
    private Long fileSize;
    private String contentType;
    private Instant createdAt;
    private Instant updatedAt;
}

