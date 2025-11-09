package com.hieunguyen.podcastai.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hieunguyen.podcastai.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    
    boolean existsByEmail(String email);
    
    boolean existsByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmailOrUsername(String email, String username);

    @Query("""
        SELECT u FROM User u
        LEFT JOIN FETCH u.roles r
        LEFT JOIN FETCH r.permissions
        WHERE u.email = :email
    """)
    Optional<User> findByEmailWithRolesAndPermissions(@Param("email") String email);

    @Query("""
        SELECT u FROM User u
        LEFT JOIN FETCH u.defaultTtsConfig
        WHERE u.id = :id
    """)
    Optional<User> findByIdWithDefaultTtsConfig(@Param("id") Long id);

}
