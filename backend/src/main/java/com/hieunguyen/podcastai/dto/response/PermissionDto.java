package com.hieunguyen.podcastai.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PermissionDto {
    
    private Long id;
    private String name;
    private String code;
    private String description;
    private String resource;
    private String action;
    private Boolean isActive;
    private Integer rolesCount;
}

