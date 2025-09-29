package com.hieunguyen.podcastai.dto.response;

import com.hieunguyen.podcastai.enums.FavoriteType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFavoriteDto {
    
    private Long id;
    private FavoriteType type;
    private Long itemId;
    private String itemTitle;
    private String itemDescription;
    private String itemImageUrl;
    private Instant createdAt;
}
