package com.hieunguyen.podcastai.repository;

import com.hieunguyen.podcastai.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long>, JpaSpecificationExecutor<Role> {
    
    Optional<Role> findByCode(String code);
    
    Optional<Role> findByName(String name);
    
    boolean existsByCode(String code);
    
    boolean existsByName(String name);
}

