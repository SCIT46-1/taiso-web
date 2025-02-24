package com.taiso.bike_api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taiso.bike_api.domain.UserStatusEntity;

@Repository
public interface UserStatusRepository extends JpaRepository<UserStatusEntity, Integer> {
    Optional<UserStatusEntity> findByStatusName(String statusName);
}
