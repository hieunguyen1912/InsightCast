package com.hieunguyen.podcastai.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hieunguyen.podcastai.enums.UserRole;
import com.hieunguyen.podcastai.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDto {
    
    private Long id;
    private String username;
    private String email;
    private Date dateOfBirth;
    private String phoneNumber;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private UserRole role;
    private UserStatus status;
    private Boolean emailVerified;
    private Instant createdAt;
    private Instant updatedAt;
}