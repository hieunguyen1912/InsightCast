package com.hieunguyen.podcastai.dto.request;

import com.hieunguyen.podcastai.enums.FavoriteType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFavoriteRequest {
    
    @NotNull(message = "Favorite type is required")
    private FavoriteType type;
    
    @NotNull(message = "Item ID is required")
    private Long itemId;
}
