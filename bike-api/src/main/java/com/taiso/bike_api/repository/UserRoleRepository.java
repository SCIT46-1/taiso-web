package com.taiso.bike_api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taiso.bike_api.domain.UserRoleEntity;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRoleEntity, Integer> {
    Optional<UserRoleEntity> findByRoleName(String roleName);
}
