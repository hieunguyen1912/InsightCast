package com.hieunguyen.podcastai.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hieunguyen.podcastai.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.Date;
import java.util.List;

@Getter
@Setter
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
    private List<String> roles;
    private UserStatus status;
    private Boolean emailVerified;
    private Instant createdAt;
    private Instant updatedAt;
}