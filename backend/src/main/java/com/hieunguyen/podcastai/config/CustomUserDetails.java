package com.hieunguyen.podcastai.config;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.hieunguyen.podcastai.entity.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.hieunguyen.podcastai.entity.User;
import com.hieunguyen.podcastai.enums.UserStatus;

public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<Role> roles = user.getRoles();
        Set<GrantedAuthority> authorities = new HashSet<>();
        for (Role role : roles) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getCode()));
            role.getPermissions().stream().map(
                    permission -> new SimpleGrantedAuthority("PERMISSION_" + permission.getCode())
            ).forEach(authorities::add);
        }

        return authorities;
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
        return user.getStatus() != null && user.getStatus() == UserStatus.ACTIVE;
    }
}
