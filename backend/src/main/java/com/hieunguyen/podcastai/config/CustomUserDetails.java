package com.hieunguyen.podcastai.config;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.enums.UserStatus;

public class CustomUserDetails implements UserDetails {

    private User user;
    
    public CustomUserDetails(User user) {
        this.user = user;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }
    
    @Override
    public boolean isEnabled() {
        return user.getStatus().name().equals(UserStatus.ACTIVE.name());
    }
}
