package com.hieunguyen.podcastai.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoleDto {
    
    private Long id;
    private String name;
    private String code;
    private String description;
    private Boolean isActive;
    private List<PermissionDto> permissions;
}

