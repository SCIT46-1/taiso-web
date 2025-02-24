package com.taiso.bike_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taiso.bike_api.domain.UserDetailEntity;

@Repository
public interface UserDetailRepository extends JpaRepository<UserDetailEntity, Long> {
    
}
